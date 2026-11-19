import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { tempestPwaDevSw, tempestPwaManifest } from "tempest-react-sdk/vite";
import { contentManifest } from "./vite/contentManifest";

/**
 * Vite configuration.
 *
 * The PWA layer comes from `tempest-react-sdk/vite` instead of
 * `vite-plugin-pwa`:
 *
 * - `tempestPwaManifest` emits `dist/precache-manifest.json`, which
 *   `installPrecache()` in `src/sw.ts` reads at the worker's install event.
 * - `tempestPwaDevSw` compiles and serves the worker under `npm run dev`,
 *   replacing `VitePWA`'s `devOptions.enabled`. It shells out to `esbuild`,
 *   which rolldown-vite does not ship — hence the explicit devDependency.
 * - `contentManifest` emits `dist/content-manifest.json`, the list of every
 *   file under `public/assets` that the "Conteúdo" settings tab downloads
 *   pack by pack for offline play.
 *
 * Every PWA URL is spelled out with the `BASE` prefix because the app is
 * deployed to a GitHub Pages subpath. `tempestPwaManifest` only base-joins the
 * files Vite emits into the bundle; `appShell` and `additionalUrls` are taken
 * verbatim. Likewise `tempestPwaDevSw` matches `req.url` literally.
 */
// const BASE = "/react-jomasio-adventures/";
const BASE = "/game-development/";

export default defineConfig({
  base: BASE,
  plugins: [
    react(),

    contentManifest(),

    tempestPwaManifest({
      appShell: `${BASE}index.html`,
      additionalUrls: [
        `${BASE}manifest.webmanifest`,
        `${BASE}favicon.ico`,
        `${BASE}pwa-192x192.png`,
        `${BASE}pwa-512x512.png`,
        `${BASE}pwa-maskable-192x192.png`,
        `${BASE}pwa-maskable-512x512.png`,
      ],
    }),

    tempestPwaDevSw({
      swUrl: `${BASE}sw.js`,
      manifestUrl: `${BASE}precache-manifest.json`,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * Vendor em chunk próprio: sem isso, react/router/sdk entram no
         * `index.js`, que muda de hash a cada deploy de código nosso e derruba
         * junto 150 kB gzip que o navegador já tinha em cache. `advancedChunks`
         * (rolldown) no lugar do `manualChunks` (rollup), que esta versão marca
         * como deprecado.
         */
        advancedChunks: {
          includeDependenciesRecursively: false,
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 12,
            },
            {
              name: "router-vendor",
              test: /node_modules[\\/](react-router|react-router-dom)[\\/]/,
              priority: 12,
            },
            {
              name: "tempest-sdk",
              test: /node_modules[\\/](tempest-react-sdk)[\\/]/,
              priority: 12,
            },
            {
              name: "vendor",
              test: /node_modules[\\/]/,
              priority: 10,
            },
            {
              name: "battle",
              test: /[\\/]src[\\/](hooks[\\/]battle|components[\\/]Game[\\/]Battle|components[\\/]Game[\\/]Scenes[\\/]Battle|data[\\/]battle)/,
              priority: 5,
              minSize: 20 * 1024,
            },
            {
              name: "menus",
              test: /[\\/]src[\\/](components[\\/]Game[\\/]Navbar|hooks[\\/]menu)/,
              priority: 4,
              minSize: 20 * 1024,
            },
            {
              name: "explore",
              test: /[\\/]src[\\/](components[\\/]Game[\\/]Scenes[\\/]Explore|features|scenes|maps|interactions)/,
              priority: 3,
              minSize: 20 * 1024,
            },
          ],
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: ["commonsensical-zayden-superimprobably.ngrok-free.dev"],
  },
});
