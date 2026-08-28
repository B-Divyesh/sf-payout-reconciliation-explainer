import { copyFile, readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';

const dist = new URL('../dist/', import.meta.url);

await copyFile(
  new URL('../staticwebapp.config.json', import.meta.url),
  new URL('../dist/staticwebapp.config.json', import.meta.url),
);

const entryHtml = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const scriptPath = entryHtml.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/)?.[1];
const stylePath = entryHtml.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/)?.[1];
if (!scriptPath || !stylePath) throw new Error('Could not find the built entry assets to make the offline shell.');
const script = (await readFile(join(dist.pathname, scriptPath.slice(1)), 'utf8')).replace(/\n\/\/# sourceMappingURL=.*$/, '');
const style = await readFile(join(dist.pathname, stylePath.slice(1)), 'utf8');
for (const page of ['index.html', 'privacy/index.html', 'terms/index.html']) {
  const path = join(dist.pathname, page);
  const html = await readFile(path, 'utf8');
  await writeFile(path, html
    .replace(/<script type="module" crossorigin src="[^"]+"><\/script>/, `<script type="module">${script}</script>`)
    .replace(/<link rel="stylesheet" crossorigin href="[^"]+">/, `<style>${style}</style>`));
}

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
    // Azure Static Web Apps consumes this deployment configuration rather than
    // publishing it, so a precache request would be a 404 and abort install.
    if (path.endsWith('.map') || path === '/sw.js' || path === '/staticwebapp.config.json') return false;
    if (path.startsWith('/assets/')) return /\.(?:js|css)$/.test(path);
    if (path.startsWith('/art/')) return path === '/art/balance-field-720.avif';
    return true;
  });
const digest = createHash('sha256');
for (const path of files) {
  digest.update(path);
  digest.update(await readFile(join(dist.pathname, path.slice(1))));
}
const revision = digest.digest('hex').slice(0, 12);
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
    const fallback = url.pathname.startsWith('/privacy') ? '/privacy/index.html' : url.pathname.startsWith('/terms') ? '/terms/index.html' : url.pathname === '/' ? '/index.html' : '/offline.html';
    event.respondWith(caches.match(event.request, { ignoreSearch: true }).then(cached => cached || caches.match(fallback)).then(cached => cached || fetch(event.request)).catch(() => caches.match('/offline.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); }
    return response;
  })));
});\n`;
if (source.includes('staticwebapp.config.json')) {
  throw new Error('Deployment-only staticwebapp.config.json must not be precached by the service worker.');
}
await writeFile(new URL('../dist/sw.js', import.meta.url), source);

const index = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
if (!index.includes('<title>')) throw new Error('Built index is missing a title');
console.log(`Service worker precaches ${shell.length} files (${revision}).`);
