import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { FrameBuffer } from '../script/frame-buffer.mjs';

const settle = async () => { for (let i = 0; i < 100; i++) await Promise.resolve(); };
const fetched = async () => ({ ok: true, blob: async () => ({}) });
test('frame cache bounds live bitmaps during direction reversals and releases every bitmap', async () => {
  let live = 0, max = 0;
  const cache = new FrameBuffer({ count: 140, capacity: 7, fetcher: fetched, url: String,
    decode: async () => { live++; max = Math.max(max, live); return { close() { live--; } }; } });
  for (const index of [0, 5, 45, 110, 60, 0, 139]) {
    cache.seek(index, index < 60 ? -1 : 1); await settle();
    assert.ok(cache.frames.has(index)); assert.ok(live <= 7);
    assert.ok(cache.frames.size + cache.pending.size <= 7);
  }
  cache.release(); await settle(); assert.equal(live, 0); assert.ok(max <= 7);
  assert.equal(cache.stats.decodes, cache.stats.closed);
});
test('in-flight decodes after release are closed and cannot resurrect stale frames', async () => {
  const resolvers = []; let closed = 0;
  const cache = new FrameBuffer({ count: 40, capacity: 3, fetcher: fetched, url: String,
    decode: () => new Promise(resolve => resolvers.push(resolve)) });
  cache.seek(0); await settle(); assert.equal(resolvers.length, 2);
  cache.release(); cache.seek(39, -1);
  assert.equal(cache.pending.size, 2);
  for (const resolve of resolvers.splice(0)) resolve({ close() { closed++; } });
  await settle(); assert.equal(closed, 2); assert.equal(cache.frames.size, 0);
  cache.release();
  for (const resolve of resolvers.splice(0)) resolve({ close() { closed++; } });
  await settle(); assert.equal(cache.pending.size, 0); assert.equal(closed, 4);
});
test('failed frames do not form a fetch retry storm and later frames remain loadable', async () => {
  let attempts = 0;
  const cache = new FrameBuffer({ count: 4, url: String,
    fetcher: async () => { attempts++; return { ok: false, status: 404 }; }, decode: async () => {} });
  const warn = console.warn; console.warn = () => {};
  try { cache.seek(0); await settle(); cache.seek(0); await settle(); assert.equal(attempts, 4); }
  finally { console.warn = warn; cache.release(); }
});

Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { deviceMemory: 8, hardwareConcurrency: 8 } });
globalThis.window = { devicePixelRatio: 2, addEventListener() {} };
globalThis.document = { hidden: false };
globalThis.innerHeight = 800;
globalThis.IntersectionObserver = class { constructor(callback) { this.callback = callback; } observe() {} unobserve() {} };
const { getDeviceProfile } = await import('../script/device-profile.mjs');
const { VideoManager } = await import('../script/video-manager.mjs');
const { AnimationDriver } = await import('../script/animation-driver.mjs');
test('capability tiers handle missing signals, memory, connection and save-data', () => {
  assert.equal(getDeviceProfile({}).tier, 'mid');
  assert.equal(getDeviceProfile({ deviceMemory: 8 }).heroFrameSet, 'desktop');
  for (const nav of [{ deviceMemory: 2 }, { connection: { effectiveType: '2g' } }, { connection: { saveData: true } }])
    assert.equal(getDeviceProfile(nav).videoConcurrencyLimit, 1);
  assert.equal(getDeviceProfile({ deviceMemory: 8, connection: { effectiveType: '3g' } }).canvasFPSCap, 30);
});
test('decoder slots never overlap on swaps, and hidden pages release every source', () => {
  let live = 0, peak = 0;
  const videos = Array.from({ length: 7 }, (_, i) => ({ dataset: { src: `video${i}.mp4` }, value: '',
    set src(value) { assert.equal(this.value, ''); this.value = value; peak = Math.max(peak, ++live); },
    getAttribute() { return this.value; }, removeAttribute() { if (this.value) live--; this.value = ''; },
    querySelectorAll: () => [], addEventListener() {}, pause() {}, load() {}, play: async () => {},
    getBoundingClientRect: () => ({ top: 0, bottom: 600, width: 300, height: 600 }) }));
  const manager = new VideoManager(videos);
  for (const group of [[0, 1, 2], [3, 4, 5], [5, 6], [0]]) {
    manager.zone = new Set(group.map(i => videos[i])); manager.reconcile(); assert.ok(live <= 2);
  }
  manager.suspend(true); assert.equal(live, 0); assert.equal(manager.stats.sources, 0);
  manager.suspend(false); assert.equal(live, 1); assert.equal(peak, 2); manager.suspend(true);
});
test('renditions promote when cover geometry needs more pixels', () => {
  const manager = new VideoManager([], {}, getDeviceProfile({ deviceMemory: 2 }));
  manager.manifest = { clip: { high: { src: 'high', width: 1920, height: 1080 },
    mid: { src: 'mid', width: 1280, height: 720 }, low: { src: 'low', width: 854, height: 480 } } };
  assert.equal(manager.select({ dataset: { src: 'clip' }, getBoundingClientRect: () => ({ width: 200, height: 100 }) }), 'low');
  assert.equal(manager.select({ dataset: { src: 'clip' }, getBoundingClientRect: () => ({ width: 600, height: 350 }) }), 'mid');
  assert.equal(manager.select({ dataset: { src: 'clip' }, getBoundingClientRect: () => ({ width: 400, height: 900 }) }), 'high');
  assert.equal(manager.limit, 0);
});
test('shared driver cancels when offscreen/hidden and never schedules duplicate loops', () => {
  const pending = new Map(); let next = 1, calls = 0;
  globalThis.requestAnimationFrame = fn => { const id = next++; pending.set(id, fn); return id; };
  globalThis.cancelAnimationFrame = id => pending.delete(id);
  const driver = new AnimationDriver(), canvas = {};
  driver.register(canvas, () => calls++);
  assert.equal(pending.size, 0);
  driver.observer.callback([{ target: canvas, isIntersecting: true }]); driver.sync();
  assert.equal(pending.size, 1);
  const [id, tick] = [...pending][0]; pending.delete(id); tick(100);
  assert.equal(calls, 1); assert.equal(pending.size, 1);
  driver.suspend(true); assert.equal(pending.size, 0);
  driver.suspend(false); assert.equal(pending.size, 1);
  driver.observer.callback([{ target: canvas, isIntersecting: false }]); assert.equal(pending.size, 0);
});
test('page has no eager video source, extraction loop, or private animation loops', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /extractFrames|seeked|requestAnimationFrame|<source\b|cdn.tailwindcss.com/);
  const videos = [...html.matchAll(/<video\b([^>]*)>/g)]; assert.equal(videos.length, 6);
  for (const [, attrs] of videos) {
    assert.doesNotMatch(attrs, /\ssrc=/);
    for (const attribute of ['playsinline', 'muted', 'disablePictureInPicture', 'disableRemotePlayback', 'poster='])
      assert.ok(attrs.includes(attribute));
  }
});
test('page module parses after integration and the production stylesheet exists', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /<script type="module" src="\/script\/page.mjs">/);
  const module = readFileSync(new URL('../script/page.mjs', import.meta.url), 'utf8');
  execFileSync(process.execPath, ['--input-type=module', '--check'], { input: module, windowsHide: true });
  assert.ok(readFileSync(new URL('../css/tailwind.css', import.meta.url), 'utf8').length > 10000);
});
test('SEO metadata and script policy remain valid without inline executable code', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(schema.mainEntity.name, 'Yash Chaudhari');
  assert.equal(schema['@type'], 'ProfilePage');
  assert.match(html, /rel="canonical" href="https:\/\/yashchaudhari29.github.io\/"/);
  assert.match(html, /script-src 'self';/);
  assert.doesNotMatch(html, /\son\w+=|javascript:|document.write/);
  for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (script[1].includes('application/ld+json')) continue;
    assert.match(script[1], /src="\/script\//);
    assert.equal(script[2].trim(), '');
  }
  for (const [, attrs] of html.matchAll(/<a\b([^>]*target="_blank"[^>]*)>/g))
    assert.match(attrs, /rel="noopener noreferrer"/);
});
test('CSP allows the existing Skills CSS background image without a wildcard image policy', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const policy = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
  const imageSources = policy.match(/(?:^|;\s*)img-src\s+([^;]+)/)[1].split(/\s+/);
  const background = html.match(/background-image:\s*url\(['"](https:\/\/images\.higgs\.ai\/[^'"]+)['"]\)/)[1];
  assert.ok(imageSources.includes(new URL(background).origin));
  assert.ok(!imageSources.includes('*') && !imageSources.includes('https:'));
  assert.match(policy, /script-src 'self';/);
});
test('generated manifest references complete hero sequences and video variants', () => {
  const root = new URL('../', import.meta.url);
  const frames = JSON.parse(readFileSync(new URL('frames/manifest.json', root)));
  assert.ok(frames.mobile.count >= 20 && frames.mobile.count <= 30);
  for (const set of Object.values(frames)) for (let i = 0; i < set.count; i++)
    assert.ok(existsSync(new URL(`.${set.base}frame_${String(i).padStart(3, '0')}.webp`, root)));
  const videos = JSON.parse(readFileSync(new URL('media/manifest.json', root)));
  const html = readFileSync(new URL('index.html', root), 'utf8');
  const sources = [...new Set([...html.matchAll(/data-src="([^"]+\.mp4)"/g)].map(match => match[1]))];
  assert.deepEqual(Object.keys(videos).sort(), sources.sort());
  for (const variants of Object.values(videos)) for (const path of [variants.poster, variants.mid.src, variants.low.src])
    assert.ok(existsSync(new URL(`.${path}`, root)));
});

test('constrained connections never attach or play background video sources',()=>{
 for(const nav of [{connection:{effectiveType:'3g'}},{connection:{saveData:true}},{deviceMemory:2},{hardwareConcurrency:2}]){
  const video={dataset:{src:'large.mp4'},addEventListener(){},getAttribute(){return null;},getBoundingClientRect(){return {top:0,bottom:600};},set src(_){throw new Error('unexpected download');},play(){throw new Error('unexpected playback');}};
  const manager=new VideoManager([video],{},getDeviceProfile(nav));manager.zone.add(video);manager.reconcile();
  assert.equal(manager.stats.sources,0);assert.equal(manager.stats.active,0);
 }
 assert.equal(getDeviceProfile({deviceMemory:8,hardwareConcurrency:8}).posterOnly,false);
});
