import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// No shell interpolation; source paths, URLs and encoder options are separate argv entries.
const root = fileURLToPath(new URL('../', import.meta.url));
const config = JSON.parse(readFileSync(join(root, 'media.config.json')));
const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const mode = option('--mode', 'all');
const output = resolve(option('--output', root));
const sourceDir = option('--source-dir', '');
const cdn = option('--cdn-base', '').replace(/\/$/, '');
function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, windowsHide: true });
  if (result.error || result.status !== 0) throw result.error || new Error(result.stderr);
  return result.stdout;
}
function probe(source) {
  const data = JSON.parse(run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries',
    'format=duration:stream=width,height', '-of', 'json', source]));
  return { ...data.streams[0], duration: Number(data.format.duration) };
}
function encode(source, extra, destination) {
  run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', source, ...extra, destination]);
}
function positive(value, name, max = Infinity) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0 || number > max) throw new Error(`Invalid ${name}: ${value}`);
  return number;
}
if (mode === 'hero' || mode === 'all') {
  const cfg = config.hero;
  const source = option('--hero-input', cfg.source);
  const info = probe(source);
  const desktopFPS = positive(option('--desktop-fps', cfg.desktopFPS), 'desktop fps', 30);
  const mobileFPS = positive(option('--mobile-fps', cfg.mobileFPS), 'mobile fps', 30);
  const mobileMax = positive(option('--mobile-frames', cfg.mobileMaxFrames), 'mobile frame limit', 30);
  // Fixed viewport background uses object-fit:cover. Match BOTH viewport dimensions at DPR,
  // without upscaling beyond the source; narrow portrait viewports still need source height.
  const width = Math.min(info.width, Math.ceil(Math.max(cfg.maxRenderedWidth,
    cfg.maxRenderedHeight * info.width / info.height) * cfg.maxDPR));
  const manifest = {};
  for (const [set, fps, max] of [['desktop', desktopFPS, Infinity], ['mobile', mobileFPS, mobileMax]]) {
    const count = Math.max(2, Math.min(max, Math.ceil(info.duration * fps)));
    const sampleFPS = (count - 1) / Math.max(0.05, info.duration - 0.05);
    const dir = join(output, 'frames', set); mkdirSync(dir, { recursive: true });
    encode(source, ['-vf', `tpad=stop_mode=clone:stop_duration=1,fps=${sampleFPS}:start_time=0:round=up,scale=${width}:-1`,
      '-frames:v', String(count), '-c:v', 'libwebp', '-quality', String(cfg.webpQuality), '-compression_level', '6',
      '-start_number', '0'], join(dir, 'frame_%03d.webp'));
    manifest[set] = { count, fps: sampleFPS, width, height: Math.round(info.height * width / info.width),
      base: `${cdn}/frames/${set}/`, pattern: 'frame_%03d.webp' };
    console.log(`hero ${set}: ${count} frames at ${width}px`);
  }
  writeFileSync(join(output, 'frames', 'manifest.json'), JSON.stringify(manifest, null, 2));
}
if (mode === 'videos' || mode === 'all') {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const sources = [...new Set([...html.matchAll(/data-src="([^"]+\.mp4)"/g)].map(m => m[1]))];
  const manifest = {};
  const dir = join(output, 'media'); mkdirSync(dir, { recursive: true });
  for (const url of sources) {
    const filename = new URL(url).pathname.split('/').pop();
    const name = filename.replace(/\.mp4$/, '');
    const source = sourceDir ? join(sourceDir, filename) : url;
    const info = probe(source);
    const poster = `${name}_poster.webp`;
    encode(source, ['-frames:v', '1', '-c:v', 'libwebp', '-quality', '95'], join(dir, poster));
    const entries = { high: { src: url, width: info.width, height: info.height }, poster: `${cdn}/media/${poster}` };
    for (const [tier, height, crf] of [['mid', 720, 22], ['low', 480, 24]]) {
      const h = Math.min(height, info.height);
      const nameOut = `${name}_${tier}.mp4`;
      encode(source, ['-vf', `scale=-2:${h}`, '-c:v', 'libx264', '-preset', 'medium', '-crf', String(crf),
        '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an'], join(dir, nameOut));
      entries[tier] = { src: `${cdn}/media/${nameOut}`, width: Math.round(info.width * h / info.height / 2) * 2, height: h };
    }
    manifest[url] = entries;
    console.log(`video ${filename}: original high + mid/low + poster`);
  }
  writeFileSync(join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
}
