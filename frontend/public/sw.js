// Service worker disabled - pass through all requests without interception
self.addEventListener('fetch', (event) => {
  // Don't intercept any requests - let them pass through normally
  event.respondWith(fetch(event.request));
});
