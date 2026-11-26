/// <reference lib="webworker" />

import {
  createPartialResponse,
  installNotificationClickHandler,
  installPrecache,
  installPushHandler,
  installRuntimeCache,
  installSkipWaitingListener,
} from "tempest-react-sdk/sw";

import { CONTENT_DOWNLOAD_HEADER } from "./data/content/packs";

/**
 * Service worker, bundled to `dist/sw.js` by `vite.sw.config.ts` and registered
 * from `UpdateContext`.
 *
 * Layers, in order:
 *
 * 1. Push notifications, notification clicks and the `SKIP_WAITING` listener
 *    the update flow posts to.
 * 2. `assets/` handler that also reads the offline content packs
 *    (`content-<pack>` caches), then runtime caching for the remaining
 *    images, media and the API.
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
const BASE = "/game-development/";

installPushHandler({
  defaultTitle: "Nova notificação",
  defaultIcon: `${BASE}pwa-192x192.png`,
  defaultBadge: `${BASE}pwa-192x192.png`,
});

installNotificationClickHandler();
installSkipWaitingListener();

const IMAGE_RE = /\.(png|svg|gif|ico|webp|jpe?g)$/i;
const MEDIA_RE = /\.(mp3|m4a|wav|ogg|mp4|webm)$/i;
const ASSETS_PREFIX = `${BASE}assets/`;

/** Mesmos limites das regras de runtime abaixo, para `assets/` e o resto. */
const RUNTIME_LIMITS: Record<"images" | "media", number> = {
  images: 400,
  media: 120,
};

type SwScope = {
  addEventListener(type: "fetch", listener: (event: FetchEvent) => void): void;
  location: Location;
};

function isGameAsset(url: URL, origin: string): boolean {
  return url.origin === origin && url.pathname.startsWith(ASSETS_PREFIX);
}

async function trimCache(name: string, maxEntries: number): Promise<void> {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - maxEntries))) {
    await cache.delete(key);
  }
}

/**
 * Cache-first para `assets/` que enxerga também os pacotes de conteúdo.
 *
 * `installRuntimeCache` só consulta o próprio `cacheName`, então um arquivo
 * baixado pelo "Gerenciamento de conteúdo" (cache `content-<pacote>`) seria
 * ignorado e o jogo iria à rede — offline, quebraria. Aqui `caches.match`
 * procura em todos os caches; na falta, o arquivo vai para `images`/`media`
 * com o mesmo LRU de antes. O download do próprio pacote (header
 * `CONTENT_DOWNLOAD_HEADER`) vai direto para a rede: quem grava é a página.
 */
async function handleGameAsset(request: Request): Promise<Response> {
  if (request.headers.has(CONTENT_DOWNLOAD_HEADER)) return fetch(request);

  const url = new URL(request.url);
  const isRange = request.headers.has("range");
  const plain = isRange
    ? new Request(request.url, { credentials: request.credentials })
    : request;

  let response = await caches.match(plain.url);
  if (!response) {
    response = await fetch(plain);
    const runtime = MEDIA_RE.test(url.pathname)
      ? "media"
      : IMAGE_RE.test(url.pathname)
        ? "images"
        : null;
    if (response.ok && runtime) {
      const cache = await caches.open(runtime);
      await cache.put(plain.url, response.clone());
      await trimCache(runtime, RUNTIME_LIMITS[runtime]);
    }
  }

  return isRange ? createPartialResponse(request, response) : response;
}

const swScope = self as unknown as SwScope;

swScope.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (!isGameAsset(url, swScope.location.origin)) return;
  event.respondWith(handleGameAsset(event.request));
});

installRuntimeCache([
  {
    match: (url) =>
      !isGameAsset(url, swScope.location.origin) && IMAGE_RE.test(url.href),
    strategy: "cache-first",
    cacheName: "images",
    maxEntries: RUNTIME_LIMITS.images,
  },
  {
    match: (url) =>
      !isGameAsset(url, swScope.location.origin) && MEDIA_RE.test(url.href),
    strategy: "cache-first",
    cacheName: "media",
    maxEntries: RUNTIME_LIMITS.media,
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
