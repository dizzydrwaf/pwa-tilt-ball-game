self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('tilt-ball-v1').then(cache =>
      cache.addAll(['/', '/index.html', '/style.css', '/script.js', '/manifest.json'])
    )
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});

