import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const dist = new URL('../dist/', import.meta.url);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

const files = (await walk(dist.pathname))
  .map((file) => `/${relative(dist.pathname, file).replaceAll('\\\\', '/')}`)
  .filter((path) => {
    if (path.endsWith('.map') || path === '/sw.js') return false;
    if (path.startsWith('/assets/')) return /\.(?:js|css)$/.test(path);
    if (path.startsWith('/art/')) return path === '/art/balance-field-720.avif';
    return true;
  });
const revision = Date.now().toString(36);
const shell = ['/', ...files];
const source = `const CACHE = 'payout-explainer-${revision}';
const SHELL = ${JSON.stringify(shell)};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('payout-explainer-') && key !== CACHE).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); return response;
    }).catch(async () => (await caches.match(event.request)) || (await caches.match('/index.html')) || caches.match('/offline.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); }
    return response;
  })));
});\n`;
await writeFile(new URL('../dist/sw.js', import.meta.url), source);

const index = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
if (!index.includes('<title>')) throw new Error('Built index is missing a title');
console.log(`Service worker precaches ${shell.length} files (${revision}).`);
