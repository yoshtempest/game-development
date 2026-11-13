export type ContentPackId =
  | "essencial"
  | "personagens"
  | "criaturas"
  | "cenarios"
  | "itens"
  | "efeitos"
  | "audios"
  | "videos";

export type ContentPackDef = {
  id: ContentPackId;
  label: string;
  /**
   * Pastas de primeiro nível de `public/assets` que compõem o pacote. Arquivo
   * solto na raiz de `assets/` (logo, loading) e pasta que ainda não foi
   * mapeada caem no `essencial` — assim um diretório novo nunca some da tela.
   */
  folders: readonly string[];
  /** `false` só no essencial: é o que o jogo pede logo na primeira tela. */
  removable: boolean;
};

/** Caminho do manifesto gerado no build por `vite/contentManifest.ts`. */
export const CONTENT_MANIFEST_FILE = "content-manifest.json";

/**
 * Prefixo dos caches de pacote. O service worker procura neles antes do cache
 * de runtime, então um pacote baixado continua servindo offline mesmo depois
 * que o LRU de `images`/`media` (400/120 entradas) descartar o arquivo.
 */
export const CONTENT_CACHE_PREFIX = "content-";

/**
 * Header que marca o fetch de download do pacote. O service worker deixa esse
 * request passar direto para a rede, sem gravá-lo também no cache de runtime —
 * senão cada arquivo baixado ocuparia o armazenamento duas vezes.
 */
export const CONTENT_DOWNLOAD_HEADER = "X-Content-Pack";

export const CONTENT_PACKS: readonly ContentPackDef[] = [
  {
    id: "essencial",
    label: "Essencial",
    folders: ["navbar", "status", "badges", "map", "plates", "quests"],
    removable: false,
  },
  {
    id: "personagens",
    label: "Personagens",
    folders: ["player"],
    removable: true,
  },
  {
    id: "criaturas",
    label: "Criaturas e NPCs",
    folders: ["npcs"],
    removable: true,
  },
  {
    id: "cenarios",
    label: "Cenários",
    folders: ["cenarios", "history"],
    removable: true,
  },
  {
    id: "itens",
    label: "Itens e equipamentos",
    folders: ["items", "equipments"],
    removable: true,
  },
  {
    id: "efeitos",
    label: "Habilidades e efeitos",
    folders: ["effects"],
    removable: true,
  },
  { id: "audios", label: "Áudios", folders: ["songs"], removable: true },
  { id: "videos", label: "Vídeos", folders: ["videos"], removable: true },
];

/**
 * Resolve o pacote de um caminho relativo a `assets/` (ex.: `npcs/x/a.svg`).
 * É a regra única de agrupamento: o cálculo de estado e o download leem daqui,
 * então o arquivo contado como "instalado" é o mesmo que foi gravado.
 */
export function getPackIdForAssetPath(path: string): ContentPackId {
  const folder = path.includes("/") ? path.slice(0, path.indexOf("/")) : "";
  const pack = CONTENT_PACKS.find((p) => p.folders.includes(folder));
  return pack?.id ?? "essencial";
}

export function getContentCacheName(id: ContentPackId): string {
  return `${CONTENT_CACHE_PREFIX}${id}`;
}
