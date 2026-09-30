// One capability snapshot shared by all media consumers. Thresholds require device testing.
export function getDeviceProfile(nav = navigator) {
  const mem = nav.deviceMemory || 4;
  const cores = nav.hardwareConcurrency || 4;
  const conn = nav.connection?.effectiveType || '4g';
  const saveData = nav.connection?.saveData || false;
  const tier = saveData || mem <= 2 || conn === '2g' || conn === 'slow-2g' ? 'low'
    : mem <= 4 || conn === '3g' ? 'mid' : 'high';
  const posterOnly = saveData || mem <= 2 || cores <= 2 || ["slow-2g", "2g", "3g"].includes(conn);
  return Object.freeze({ tier, mem, cores, posterOnly, videoRendition: tier === 'high' ? 'high' : tier === 'mid' ? 'mid' : 'low',
    heroFrameSet: tier === 'high' ? 'desktop' : 'mobile', canvasDPRCap: tier === 'low' ? 1.5 : 2,
    canvasFPSCap: tier === 'low' ? 24 : tier === 'mid' ? 30 : 60, videoConcurrencyLimit: tier === 'low' ? 1 : 2 });
}
export const profile = getDeviceProfile();
export const MEDIA_CONFIG = Object.freeze({ videoConcurrencyLimit: 2, activationMargin: 200,
  heroRadius: 15, heroDecodedBytes: 64 * 1024 * 1024 });
export const canvasDPR = () => Math.min(window.devicePixelRatio || 1, profile.canvasDPRCap, 2);
navigator.connection?.addEventListener('change', () => {
  console.info('[media] connection changed; current profile retained until reload', navigator.connection.effectiveType,
    { saveData: navigator.connection.saveData });
});
