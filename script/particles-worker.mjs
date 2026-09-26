import { createParticles } from './particles.mjs';
let renderer, timer = 0, active = false, last = 0, fps = 60, debug = false, frames = 0;
function tick(time) {
  timer = 0;
  if (!active) return;
  const delta = last ? time - last : 1000 / 60;
  if (!last || delta >= 1000 / fps - 0.5) {
    renderer.render(time, Math.min(delta, 100)); last = time;
    if (debug) self.postMessage({ type: 'frame', at: Date.now(), frames: ++frames });
  }
  timer = requestAnimationFrame(tick);
}
self.onmessage = ({ data }) => {
  if (data.type === 'init') {
    renderer = createParticles(data.canvas, data.width, data.height, data.dpr); fps = data.fps; debug = data.debug;
    self.postMessage({ type: 'ready' });
  }
  if (data.type === 'resize') renderer?.resize(data.width, data.height, data.dpr);
  if (data.type === 'active') {
    active = data.value; last = 0;
    if (!active && timer) { cancelAnimationFrame(timer); timer = 0; }
    if (active && renderer && !timer) timer = requestAnimationFrame(tick);
  }
};
