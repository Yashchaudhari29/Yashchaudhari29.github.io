import { profile, canvasDPR } from './device-profile.mjs';
import { driver } from './animation-driver.mjs';
import { initHero } from './hero.mjs';
import { VideoManager } from './video-manager.mjs';
import { createParticles } from './particles.mjs';
import { mountDiagnostics } from './media-diagnostics.mjs';

let videos, heroStats, worker, workerReady = false, workerActive = false, pageHidden = document.hidden;
const lifecycle = value => { pageHidden = value; driver.suspend(value); videos?.suspend(value); };
document.addEventListener('visibilitychange', () => lifecycle(document.hidden));
window.addEventListener('pagehide', () => lifecycle(true));
window.addEventListener('pageshow', () => lifecycle(document.hidden));

export function initMedia() {
  const debug = new URLSearchParams(location.search).has('media-debug');
  const workerFrames = [];
  initHero().then(stats => { heroStats = stats; });
  fetch('/media/manifest.json').then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .catch(error => { console.warn('[video] using original renditions', error); return {}; })
    .then(manifest => { videos = new VideoManager(document.querySelectorAll('video[data-src]'), manifest); videos.suspend(pageHidden); });
  if (profile.posterOnly) {
    document.getElementById('particle-canvas').hidden=true;
    window.mediaDiagnostics=()=>({profile,hero:heroStats?.(),videos:videos?.stats,particleWorker:false});
    return;
  }
  let canvas = document.getElementById('particle-canvas');
  let unregister, resize;
  function fallback() {
    worker?.terminate(); worker = null; workerReady = false; unregister?.();
    if (resize) window.removeEventListener('resize', resize);
    // A transferred canvas cannot get a main-thread context again; replace it in place.
    const replacement = canvas.cloneNode(false); canvas.replaceWith(replacement); canvas = replacement;
    const renderer = createParticles(canvas, innerWidth, innerHeight, canvasDPR());
    unregister = driver.register(canvas, renderer.render);
    resize = () => renderer.resize(innerWidth, innerHeight, canvasDPR());
    window.addEventListener('resize', resize, { passive: true });
  }
  if (canvas.transferControlToOffscreen && typeof Worker !== 'undefined') {
    try {
      worker = new Worker(new URL('./particles-worker.mjs', import.meta.url), { type: 'module' });
      worker.onerror = fallback;
      worker.onmessage = ({ data }) => {
        if (data.type === 'ready') workerReady = true;
        if (data.type === 'frame') { workerFrames.push(data.at); if (workerFrames.length > 180) workerFrames.shift(); }
      };
      const offscreen = canvas.transferControlToOffscreen();
      worker.postMessage({ type: 'init', canvas: offscreen, width: innerWidth, height: innerHeight,
        dpr: canvasDPR(), fps: profile.canvasFPSCap, debug }, [offscreen]);
      unregister = driver.register(canvas, null, value => {
        if (value !== workerActive) { workerActive = value; worker?.postMessage({ type: 'active', value }); }
      });
      resize = () => worker?.postMessage({ type: 'resize', width: innerWidth, height: innerHeight, dpr: canvasDPR() });
      window.addEventListener('resize', resize, { passive: true });
    } catch { fallback(); }
  } else fallback();
  // Read-only diagnostics for DevTools and automated invariant checks.
  window.mediaDiagnostics = () => ({ profile, hero: heroStats?.(), videos: videos?.stats,
    particleWorker: workerReady, particleWorkerActive: workerActive && workerReady,
    canvasRAF: Boolean(driver.raf) });
  if (debug) mountDiagnostics(window.mediaDiagnostics, lifecycle, workerFrames);
}
