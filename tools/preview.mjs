import { createServer } from 'node:http';
import { statSync, createReadStream, realpathSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const realRoot = realpathSync.native(root);
const publicFolders = new Set(['assets', 'certi&lor', 'css', 'script', 'frames', 'media']);
const publicFiles = new Set(['index.html', 'robots.txt', 'sitemap.xml', 'Yash_Chaudhari_cv.pdf']);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.css': 'text/css', '.mp4': 'video/mp4', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };
export function createPreviewServer() { return createServer((req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
    if (![ `127.0.0.1:${req.socket.localPort}`, `localhost:${req.socket.localPort}` ].includes(req.headers.host)) { res.writeHead(403).end(); return; }
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const parts = pathname.replaceAll('\\', '/').split('/').filter(Boolean);
    if (parts.some(part => part.startsWith('.')) || (parts.length && !publicFolders.has(parts[0]) &&
      !(parts.length === 1 && publicFiles.has(parts[0])))) { res.writeHead(403).end(); return; }
    const path = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!path.startsWith(resolve(root) + sep)) { res.writeHead(403).end(); return; }
    if (!realpathSync.native(path).startsWith(realRoot + sep)) { res.writeHead(403).end(); return; }
    const stat = statSync(path);
    if (!stat.isFile()) { res.writeHead(404).end(); return; }
    const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    const start = range ? Number(range[1]) : 0;
    const end = range && range[2] ? Math.min(Number(range[2]), stat.size - 1) : stat.size - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= stat.size) { res.writeHead(416).end(); return; }
    const headers = { 'Content-Type': types[extname(path)] || 'application/octet-stream',
      'Content-Length': end - start + 1, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
    if (range) headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
    res.writeHead(range ? 206 : 200, headers);
    if (req.method === 'HEAD') res.end(); else createReadStream(path, { start, end }).pipe(res);
  } catch { res.writeHead(404).end(); }
}); }
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createPreviewServer().listen(4173, '127.0.0.1', () => console.log('Preview: http://127.0.0.1:4173'));
}
