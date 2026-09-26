import { FrameBuffer } from './frame-buffer.mjs';
import { profile, canvasDPR, MEDIA_CONFIG } from './device-profile.mjs';
import { driver } from './animation-driver.mjs';

export async function initHero() {
  const canvas = document.getElementById('vCanvas'), poster = document.getElementById('vPoster');
  const context = canvas.getContext('2d');
  let manifest;
  try {
    const response = await fetch('/frames/manifest.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    manifest = (await response.json())[profile.heroFrameSet];
  } catch (error) { console.warn('[hero] frame manifest unavailable; keeping poster', error); return; }
  let buffer, smoothP = 0, lastIndex = -1, active = false, dirty = true, previousTarget = 0, direction = 1;
  function resize() {
    const previous = buffer?.frames.get(lastIndex) || buffer?.frames.get(buffer.target);
    const dpr = canvasDPR();
    canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr);
    if (previous) context.drawImage(previous, 0, 0, canvas.width, canvas.height);
    else { canvas.style.opacity = '0'; poster.style.opacity = '1'; }
    buffer?.release();
    // Decode only the source crop actually visible through object-fit:cover. Retain pixel density.
    const scale = Math.max(canvas.width / manifest.width, canvas.height / manifest.height);
    const cropW = Math.min(manifest.width, Math.round(canvas.width / scale));
    const cropH = Math.min(manifest.height, Math.round(canvas.height / scale));
    const sx = Math.floor((manifest.width - cropW) / 2), sy = Math.floor((manifest.height - cropH) / 2);
    const width = Math.min(cropW, canvas.width), height = Math.min(cropH, canvas.height);
    const capacity = Math.max(1, Math.min(31, Math.floor(MEDIA_CONFIG.heroDecodedBytes / (width * height * 4))));
    // Reuse the buffer so outstanding decode reservations survive resize and remain bounded.
    const decode = blob => createImageBitmap(blob, sx, sy, cropW, cropH,
      { resizeWidth: width, resizeHeight: height, resizeQuality: 'high' });
    if (buffer) Object.assign(buffer, { capacity, decode });
    else buffer = new FrameBuffer({ count: manifest.count, radius: MEDIA_CONFIG.heroRadius, capacity,
      url: i => `${manifest.base}frame_${String(i).padStart(3, '0')}.webp`, decode,
      onFrame: i => { if (i === buffer.target) dirty = true; } });
    buffer.bytesPerFrame = width * height * 4;
    dirty = true; lastIndex = -1;
  }
  resize();
  // Mobile browser chrome can emit a resize on every scroll tick. Coalesce it and
  // keep the last rendered image visible while the new crop is being decoded.
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); }, { passive: true });
  driver.register(canvas, (_time, delta) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const target = max > 0 ? Math.max(0, Math.min(1, scrollY / max)) : 0;
    smoothP += (target - smoothP) * (1 - Math.pow(0.92, delta / (1000 / 60)));
    const index = Math.min(manifest.count - 1, Math.floor(smoothP * (manifest.count - 1) + 0.0001));
    if (target !== previousTarget) direction = target > previousTarget ? 1 : -1;
    const bitmap = buffer.seek(index, direction); previousTarget = target;
    if (bitmap && (dirty || index !== lastIndex)) {
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      canvas.style.opacity = '1'; poster.style.opacity = '0'; lastIndex = index; dirty = false;
    }
  }, enabled => {
    if (active === enabled) return;
    active = enabled;
    if (!active) {
      buffer.release(); context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.opacity = '0'; poster.style.opacity = '1';
    }
    else dirty = true;
  });
  // This canvas is fixed and visible behind the ENTIRE page, so section #home leaving
  // view is not an unmount. The driver releases on canvas exit, hidden tab, and pagehide.
  return () => buffer.stats;
}
