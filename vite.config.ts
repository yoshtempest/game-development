import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { tempestPwaDevSw, tempestPwaManifest } from "tempest-react-sdk/vite";

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
 *
 * Every PWA URL is spelled out with the `BASE` prefix because the app is
 * deployed to a GitHub Pages subpath. `tempestPwaManifest` only base-joins the
 * files Vite emits into the bundle; `appShell` and `additionalUrls` are taken
 * verbatim. Likewise `tempestPwaDevSw` matches `req.url` literally.
 */
// const BASE = "/react-jomasio-adventures/";
const BASE = "/jomasio-adventures/";

export default defineConfig({
  base: BASE,
  plugins: [
    react(),

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
          groups: [
            {
              name: "vendor",
              test: /node_modules[\\/]/,
              priority: 10,
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
  },
});
