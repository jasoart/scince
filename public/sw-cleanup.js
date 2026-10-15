// Previous releases exposed a paper cache. It is intentionally retired.
self.addEventListener('activate', event => {
  event.waitUntil(caches.delete('scince-papers-v1'));
});
