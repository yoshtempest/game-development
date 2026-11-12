import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import type { Plugin } from "vite";

/**
 * Nome do arquivo emitido na raiz do `dist/` (e servido no dev). O cliente lê
 * a mesma constante espelhada em `src/data/content/packs.ts`.
 */
const MANIFEST_FILE = "content-manifest.json";

/**
 * Extensões que o jogo realmente carrega. Fica explícito para não publicar no
 * manifesto arquivos de apoio que moram em `public/assets` (ex.: o
 * `howToGenerateWebm.md` de `videos/`), que o jogador nunca precisaria baixar.
 */
const ASSET_EXTENSIONS =
  /\.(svg|png|gif|webp|jpe?g|ico|mp3|m4a|wav|ogg|mp4|webm)$/i;

type ManifestFile = { path: string; size: number };

/**
 * Lista recursivamente os assets de `root`, com caminho relativo em `/` (o
 * formato da URL) e o tamanho em bytes — o tamanho é o que permite à tela de
 * Gerenciamento de conteúdo mostrar quanto cada pacote ocupa antes de baixar.
 */
function listAssets(root: string, dir: string = root): ManifestFile[] {
  const files: ManifestFile[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listAssets(root, full));
    } else if (ASSET_EXTENSIONS.test(entry.name)) {
      files.push({
        path: relative(root, full).split(sep).join("/"),
        size: statSync(full).size,
      });
    }
  }
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

/**
 * Gera `content-manifest.json` com todos os arquivos de `public/assets`.
 *
 * O Cache Storage não sabe quais arquivos existem no servidor, então o "baixar
 * pacote para jogar offline" precisa de uma lista fechada produzida no build.
 * O caminho é relativo a `assets/`; o cliente prefixa com `BASE_URL`, o que
 * mantém o manifesto válido em qualquer subpath do GitHub Pages. No dev a
 * mesma lista é servida por middleware, sem gravar nada em disco.
 */
export function contentManifest(): Plugin {
  let assetsDir = "";
  let base = "/";

  function build(): string {
    return JSON.stringify({ files: listAssets(assetsDir) });
  }

  return {
    name: "jomasio-content-manifest",
    configResolved(config) {
      assetsDir = join(config.publicDir, "assets");
      base = config.base;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split("?")[0] !== `${base}${MANIFEST_FILE}`) {
          next();
          return;
        }
        res.setHeader("Content-Type", "application/json");
        res.end(build());
      });
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: MANIFEST_FILE,
        source: build(),
      });
    },
  };
}
