// Opt-in local QA surface: no polling, telemetry or blocking work on the normal page.
export function mountDiagnostics(snapshot, lifecycle, workerFrames) {
  const panel = document.createElement('aside');
  panel.id = 'media-debug';
  panel.style.cssText = 'position:fixed;bottom:8px;left:8px;z-index:99999;background:#111e;color:#fff;padding:10px;font:11px monospace;max-width:95vw;max-height:45vh;overflow:auto';
  const output = document.createElement('pre');
  output.id = 'media-debug-output'; output.style.whiteSpace = 'pre-wrap';
  const button = (label, action) => {
    const b = document.createElement('button'); b.textContent = label; b.style.cssText = 'margin:4px;padding:4px;border:1px solid #aaa';
    b.onclick = action; panel.append(b);
  };
  let maxLongTask = 0, blockResult = 'not run';
  try { new PerformanceObserver(list => {
    for (const entry of list.getEntries()) maxLongTask = Math.max(maxLongTask, entry.duration);
  }).observe({ type: 'longtask', buffered: true }); } catch { /* Unsupported on some browsers. */ }
  button('Suspend media', () => lifecycle(true));
  button('Resume media', () => lifecycle(false));
  button('Reset timing sample', () => { maxLongTask = 0; });
  button('Block main thread 600ms', () => {
    const start = Date.now(), end = start + 600;
    while (Date.now() < end) { /* Intentional, opt-in worker independence test. */ }
    setTimeout(() => {
      const during = workerFrames.filter(at => at > start && at < end).length;
      blockResult = `${during} worker frames rendered during main-thread block`;
    }, 150);
  });
  panel.append(output); document.body.append(panel);
  setInterval(() => { output.textContent = JSON.stringify({ ...snapshot(), maxLongTask, blockResult }, null, 2); }, 500);
}
