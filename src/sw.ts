/// <reference lib="webworker" />

import {
  installNotificationClickHandler,
  installPrecache,
  installPushHandler,
  installRuntimeCache,
  installSkipWaitingListener,
} from "tempest-react-sdk/sw";

/**
 * Service worker, bundled to `dist/sw.js` by `vite.sw.config.ts` and registered
 * from `UpdateContext`.
 *
 * Layers, in order:
 *
 * 1. Push notifications, notification clicks and the `SKIP_WAITING` listener
 *    the update flow posts to.
 * 2. Runtime caching for images, media and the API.
 * 3. Precache of the app shell, read from the `precache-manifest.json` that
 *    `tempestPwaManifest()` emits at build time.
 *
 * `installRuntimeCache` is registered BEFORE `installPrecache` on purpose: the
 * precache installs a catch-all fetch handler, so the specific routes have to
 * claim their requests first.
 *
 * Media uses `rangeRequests` so seeking inside a cached BGM or cutscene video
 * works offline — a partial-content request against a plain cached response
 * fails, which is why the previous Workbox `CacheFirst` rule broke scrubbing.
 */
// const BASE = "/react-jomasio-adventures/";
const BASE = "/jomasio-adventures/";

installPushHandler({
  defaultTitle: "Nova notificação",
  defaultIcon: `${BASE}pwa-192x192.png`,
  defaultBadge: `${BASE}pwa-192x192.png`,
});

installNotificationClickHandler();
installSkipWaitingListener();

installRuntimeCache([
  {
    match: /\.(png|svg|gif|ico|webp|jpe?g)$/i,
    strategy: "cache-first",
    cacheName: "images",
    maxEntries: 400,
  },
  {
    match: /\.(mp3|m4a|wav|ogg|mp4|webm)$/i,
    strategy: "cache-first",
    cacheName: "media",
    maxEntries: 120,
    rangeRequests: true,
  },
  {
    match: (url) => url.pathname.startsWith("/api/"),
    strategy: "network-first",
    cacheName: "api",
    networkTimeoutSeconds: 5,
    maxEntries: 50,
    maxAgeSeconds: 300,
  },
]);

installPrecache({
  manifestUrl: `${BASE}precache-manifest.json`,
  navigateFallback: `${BASE}index.html`,
  navigateFallbackDenylist: [/^\/api\//],
});
