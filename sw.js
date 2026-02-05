self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("lager-cache").then(cache => {
      return cache.addAll([
        "index.html",
        "app.js"
      ]);
    })
  );
});