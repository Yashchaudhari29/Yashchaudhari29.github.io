import { profile, canvasDPR } from './device-profile.mjs';

export class AnimationDriver {
  constructor(fps = profile.canvasFPSCap) {
    this.fps = fps;
    this.entries = new Map(); this.raf = 0; this.suspended = document.hidden;
    this.observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const item = this.entries.get(entry.target);
        if (item) { item.isActive = entry.isIntersecting; item.last = 0; }
      }
      this.sync();
    }, { rootMargin: '100px' });
    this.tick = this.tick.bind(this);
  }
  register(canvas, render, activity) {
    this.entries.set(canvas, { render, activity, isActive: false, last: 0 });
    this.observer.observe(canvas);
    return () => { this.observer.unobserve(canvas); this.entries.delete(canvas); this.sync(); };
  }
  sync() {
    let runnable = false;
    for (const item of this.entries.values()) {
      const active = item.isActive && !this.suspended;
      item.activity?.(active);
      if (active && item.render) runnable = true;
      if (!active) item.last = 0;
    }
    if (!runnable && this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; }
    if (runnable && !this.raf) this.raf = requestAnimationFrame(this.tick);
  }
  tick(time) {
    this.raf = 0;
    for (const item of this.entries.values()) {
      if (!item.isActive || this.suspended || !item.render) continue;
      const delta = item.last ? time - item.last : 1000 / 60;
      if (item.last && delta < 1000 / this.fps - 0.5) continue;
      item.last = time;
      try { item.render(time, Math.min(delta, 100)); } catch (error) { console.error('[canvas]', error); item.isActive = false; }
    }
    this.sync();
  }
  suspend(value) { this.suspended = value; this.sync(); }
}
export const driver = new AnimationDriver();

// Project canvases retain DOM-side layout/resize handling and share this driver.
// The full-screen O(n²) particle renderer is offloaded first.
export function sizeProjectCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  const size = { width: canvas.offsetWidth || 500, height: 176 };
  const resize = () => {
    size.width = canvas.offsetWidth || 500;
    const dpr = canvasDPR();
    canvas.width = Math.round(size.width * dpr); canvas.height = Math.round(size.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  const observer = new ResizeObserver(resize); observer.observe(canvas);
  window.addEventListener('resize', resize, { passive: true });
  return { ctx, size };
}
