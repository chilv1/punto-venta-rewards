const CACHE_NAME = "pdv-rewards-v4";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/manifest.webmanifest",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => caches.match("/index.html"));
    })
  );
});

async function broadcastToClients(message) {
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true
  });

  clients.forEach((client) => client.postMessage(message));
}

self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch (_error) {
    payload = {
      title: "Programa Punto de Venta",
      body: event.data ? event.data.text() : ""
    };
  }

  const title = payload.title || "Programa Punto de Venta";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icons/icon-192.svg",
    badge: payload.badge || "/icons/icon-192.svg",
    tag: payload.tag || `announcement-${Date.now()}`,
    renotify: payload.renotify === true,
    requireInteraction: payload.requireInteraction === true,
    vibrate: Array.isArray(payload.vibrate) ? payload.vibrate : [240, 120, 240],
    silent: payload.silent === true ? true : false,
    actions: Array.isArray(payload.actions) ? payload.actions : [],
    data: {
      url: payload.url || "/",
      announcement: payload.announcement || null,
      playSound: payload.playSound === true
    }
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      broadcastToClients({
        type: "announcement-push",
        payload
      })
    ])
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") {
    return;
  }
  const targetUrl = event.notification?.data?.url || "/";
  const message = {
    type: "announcement-open",
    payload: {
      announcement: event.notification?.data?.announcement || null,
      playSound: event.notification?.data?.playSound === true
    }
  };

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existingClient = clients.find((client) => client.url.startsWith(self.location.origin));
      if (existingClient) {
        return existingClient.focus().then(() => {
          existingClient.postMessage(message);
          return existingClient.navigate(targetUrl);
        });
      }
      return self.clients.openWindow(targetUrl).then((client) => {
        client?.postMessage(message);
        return client;
      });
    })
  );
});
