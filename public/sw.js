const CACHE = 'teman-shell-v5';
const MAP_CACHE = 'teman-map-packs-v1';
const CORE = ['/', '/manifest.webmanifest', '/teman-icon.svg?v=3'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE && key !== MAP_CACHE).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

async function responseForRange(request, cached) {
  const range = request.headers.get('range');
  if (!range) return cached;

  const match = /^bytes=(\d+)-(\d*)$/i.exec(range.trim());
  if (!match) return cached;

  const buffer = await cached.arrayBuffer();
  const size = buffer.byteLength;
  const start = Number(match[1]);
  const requestedEnd = match[2] ? Number(match[2]) : size - 1;
  const end = Math.min(requestedEnd, size - 1);

  if (!Number.isFinite(start) || start < 0 || start >= size || end < start) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': `bytes */${size}` },
    });
  }

  const slice = buffer.slice(start, end + 1);
  const headers = new Headers(cached.headers);
  headers.set('Content-Type', cached.headers.get('Content-Type') || 'application/vnd.pmtiles');
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(slice.byteLength));

  return new Response(slice, { status: 206, headers });
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/maps/') && url.pathname.endsWith('.pmtiles')) {
    event.respondWith(
      caches.open(MAP_CACHE).then(async (cache) => {
        const cached = await cache.match(url.href);
        if (cached) return responseForRange(request, cached);
        return fetch(request);
      }),
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put('/', copy));
          }
          return response;
        })
        .catch(async () => (await caches.match('/')) || Response.error()),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
