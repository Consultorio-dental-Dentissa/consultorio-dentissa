/*
 * Service worker de Dentissa (PWA sin dependencias).
 *
 * Qué guarda en caché: SOLO el "cascarón" de la app (HTML, JS, CSS, fuentes e iconos del mismo origen) para
 * que abra sin conexión. NUNCA guarda respuestas de la API (otro origen y datos clínicos/de sesión): esas
 * peticiones ni siquiera pasan por este worker. Sin conexión la app abre, pero los datos no cargan.
 *
 * Al compilar, `vite.config.ts` sustituye los dos marcadores de abajo (entre comillas) por el identificador de
 * la versión y la lista de archivos generados; así cada despliegue crea una caché nueva y borra las anteriores.
 */
const BUILD_ID = "__BUILD_ID__";
const PRECACHE = "__PRECACHE__";
const CACHE = `dentissa-${BUILD_ID}`;
const CORE = ["/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  const urls = [...CORE, ...(Array.isArray(PRECACHE) ? PRECACHE : [])];
  event.waitUntil(
    caches
      .open(CACHE)
      // Se tolera que un archivo falle (p. ej. en desarrollo): no debe impedir instalar el worker.
      .then((cache) => Promise.allSettled(urls.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("dentissa-") && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // La API y cualquier otro origen quedan fuera: siempre a la red, sin caché.
  if (url.origin !== self.location.origin) return;

  // Navegación (HTML): red primero para recibir siempre la versión nueva; sin conexión, el index guardado.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put("/", copy));
          }
          return response;
        })
        .catch(() => caches.match("/").then((cached) => cached || Response.error())),
    );
    return;
  }

  // Archivos con hash (/assets/), iconos y manifiesto: caché primero.
  if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/icons/") || url.pathname === "/manifest.webmanifest") {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
  // Cualquier otra petición del mismo origen pasa directo a la red.
});
