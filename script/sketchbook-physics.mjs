export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
export const wrap = (n, total) => ((n % total) + total) % total;
export function leafGeometry(progress, count = 18) {
  const p = clamp(progress, 0, 1), bend = 34 * Math.sin(Math.PI * p);
  const base = 180 * p + bend, delta = -2 * bend / count;
  return { base, delta, shade: Math.sin(Math.PI * p), light: Array.from({ length: count }, (_, i) => Math.abs(Math.cos((base + i * delta) * Math.PI / 180))) };
}
export function commits(progress, velocity, distance, cancelled = false) {
  return !cancelled && (distance < 6 || progress > .42 || velocity > .85);
}
export function riffleSequence(count) {
  return Array.from({ length: count }, (_, i) => ({to:(i+1)%count,duration:240-115*Math.sin(Math.PI*i/Math.max(1,count-1))}));
}
export function lensView(x,y,width,height,zoom,magnification=2.15) {
  const left=width*(1-zoom)/2,top=height*(1-zoom)/2;
  const edge=Math.min(x-left,left+width*zoom-x,y-top,top+height*zoom-y);
  return {tx:x*(1-magnification),ty:y*(1-magnification),opacity:clamp((edge+24)/65,0,1)};
}
