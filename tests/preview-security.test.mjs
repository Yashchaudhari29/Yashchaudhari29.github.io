import test from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { createPreviewServer } from '../tools/preview.mjs';

test('preview serves public assets and blocks private files, writes and hostile Host headers', async () => {
  const server = createPreviewServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const query = (path, method = 'GET', headers = {}) => new Promise((resolve, reject) => {
    const req = request({ hostname: '127.0.0.1', port, path, method, headers }, response => {
      response.resume(); response.on('end', () => resolve({ status: response.statusCode, headers: response.headers }));
    }); req.on('error', reject); req.end();
  });
  try {
    for (const path of ['/', '/robots.txt', '/sitemap.xml', '/script/page.mjs', '/css/tailwind.css']) {
      const result = await query(path);
      assert.equal(result.status, 200, path);
      assert.equal(result.headers['x-content-type-options'], 'nosniff');
      assert.equal(result.headers['x-frame-options'], 'DENY');
    }
    for (const path of ['/.git/config', '/.env', '/package.json', '/package-lock.json',
      '/node_modules/tailwindcss/package.json', '/tools/preview.mjs', '/tests/media.test.mjs', '/assets/.secret'])
      assert.equal((await query(path)).status, 403, path);
    assert.equal((await query('/', 'POST')).status, 405);
    assert.equal((await query('/', 'GET', { Host: 'attacker.example' })).status, 403);
    assert.equal((await query('/script/page.mjs', 'GET', { Range: 'bytes=0-15' })).status, 206);
    assert.equal((await query('/script/page.mjs', 'GET', { Range: 'bytes=999999999999999999999-' })).status, 416);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
