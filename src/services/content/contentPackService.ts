import {
  CONTENT_DOWNLOAD_HEADER,
  CONTENT_MANIFEST_FILE,
  CONTENT_PACKS,
  getContentCacheName,
  getPackIdForAssetPath,
} from "@/data/content/packs";
import type { ContentPackDef, ContentPackId } from "@/data/content/packs";

export type ContentPackStatus = "installed" | "partial" | "pending";

export type ContentPackInfo = ContentPackDef & {
  status: ContentPackStatus;
  totalFiles: number;
  totalBytes: number;
  cachedFiles: number;
  cachedBytes: number;
};

export type ContentManifestFile = { url: string; size: number };

export type ContentStorageEstimate = { usage: number; quota: number };

/** Progresso do download em arquivos (não bytes: é o que o loop conhece). */
export type DownloadProgress = { done: number; total: number };

/**
 * Arquivos em paralelo por download. Seis é o limite de conexões por origem
 * do HTTP/1.1; acima disso as requisições só enfileiram no browser e travam
 * o carregamento dos sprites da cena atual.
 */
const DOWNLOAD_CONCURRENCY = 6;

/**
 * Pacotes de conteúdo offline sobre o Cache Storage.
 *
 * Cada pacote é um cache próprio (`content-<id>`) preenchido a partir do
 * `content-manifest.json` do build; o service worker consulta esses caches
 * antes da rede. O estado (instalado/parcial/pendente) é sempre derivado do
 * cache, nunca guardado em `localStorage`: o browser pode despejar o Cache
 * Storage sozinho sob pressão de espaço, e um flag salvo à parte mentiria.
 *
 * `cacheStorage`, `fetcher` e `baseUrl` entram pelo constructor para o
 * serviço não depender de `window` e poder rodar com dublês.
 */
export class ContentPackService {
  private readonly cacheStorage: CacheStorage;
  private readonly fetcher: typeof fetch;
  private readonly baseUrl: string;
  private readonly origin: string;
  private manifest: Map<ContentPackId, ContentManifestFile[]> | null = null;

  constructor(
    cacheStorage: CacheStorage,
    fetcher: typeof fetch,
    baseUrl: string,
    origin: string,
  ) {
    this.cacheStorage = cacheStorage;
    this.fetcher = fetcher;
    this.baseUrl = baseUrl;
    this.origin = origin;
  }

  /**
   * Lê o manifesto uma vez por instância. A URL vira absoluta via `new URL`
   * para casar exatamente com a chave que o browser usa quando o jogo pede o
   * mesmo arquivo por `<img src>` (espaço e acento já percent-encoded).
   */
  async loadManifest(): Promise<Map<ContentPackId, ContentManifestFile[]>> {
    if (this.manifest) return this.manifest;

    const res = await this.fetcher(`${this.baseUrl}${CONTENT_MANIFEST_FILE}`, {
      cache: "no-cache",
    });
    if (!res.ok) throw new Error(`manifesto indisponível (${res.status})`);
    const data = (await res.json()) as {
      files: { path: string; size: number }[];
    };

    const grouped = new Map<ContentPackId, ContentManifestFile[]>();
    for (const file of data.files) {
      const id = getPackIdForAssetPath(file.path);
      const url = new URL(`${this.baseUrl}assets/${file.path}`, this.origin)
        .href;
      const list = grouped.get(id) ?? [];
      list.push({ url, size: file.size });
      grouped.set(id, list);
    }
    this.manifest = grouped;
    return grouped;
  }

  async listPacks(): Promise<ContentPackInfo[]> {
    const manifest = await this.loadManifest();
    const result: ContentPackInfo[] = [];

    for (const def of CONTENT_PACKS) {
      const files = manifest.get(def.id) ?? [];
      const cached = await this.getCachedUrls(def.id);
      let cachedFiles = 0;
      let cachedBytes = 0;
      let totalBytes = 0;
      for (const file of files) {
        totalBytes += file.size;
        if (cached.has(file.url)) {
          cachedFiles += 1;
          cachedBytes += file.size;
        }
      }

      result.push({
        ...def,
        status: getStatus(cachedFiles, files.length),
        totalFiles: files.length,
        totalBytes,
        cachedFiles,
        cachedBytes,
      });
    }
    return result;
  }

  /**
   * Baixa só o que falta no pacote, então retomar um download interrompido
   * (aba fechada, rede caiu) não repete o que já foi gravado. Arquivo que
   * falhar fica de fora e o pacote termina como "parcial", não como erro: o
   * resto do conteúdo continua útil offline.
   */
  async download(
    id: ContentPackId,
    signal: AbortSignal,
    onProgress: (progress: DownloadProgress) => void,
  ): Promise<void> {
    const manifest = await this.loadManifest();
    const cached = await this.getCachedUrls(id);
    const missing = (manifest.get(id) ?? []).filter((f) => !cached.has(f.url));
    const cache = await this.cacheStorage.open(getContentCacheName(id));

    let done = 0;
    let next = 0;
    onProgress({ done, total: missing.length });

    const worker = async (): Promise<void> => {
      while (next < missing.length && !signal.aborted) {
        const file = missing[next];
        next += 1;
        if (!file) continue;
        try {
          const res = await this.fetcher(file.url, {
            signal,
            headers: { [CONTENT_DOWNLOAD_HEADER]: "1" },
          });
          if (res.ok) await cache.put(file.url, res);
        } catch {
          if (signal.aborted) return;
        }
        done += 1;
        onProgress({ done, total: missing.length });
      }
    };

    await Promise.all(
      Array.from({ length: DOWNLOAD_CONCURRENCY }, () => worker()),
    );
  }

  async remove(id: ContentPackId): Promise<void> {
    await this.cacheStorage.delete(getContentCacheName(id));
  }

  /**
   * Quanto a origem inteira ocupa (pacotes + cache de runtime + precache).
   * `null` quando o browser não expõe a API — a tela some com o total em vez
   * de mostrar zero.
   */
  async estimate(): Promise<ContentStorageEstimate | null> {
    if (typeof navigator === "undefined" || !navigator.storage?.estimate) {
      return null;
    }
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    return { usage, quota };
  }

  /**
   * Pede armazenamento persistente antes do primeiro download. Sem isso o
   * browser trata o Cache Storage como "best effort" e pode apagar centenas
   * de MB baixados de propósito na primeira faxina de espaço.
   */
  async requestPersistence(): Promise<void> {
    if (typeof navigator === "undefined" || !navigator.storage?.persist) return;
    try {
      await navigator.storage.persist();
    } catch {
      return;
    }
  }

  private async getCachedUrls(id: ContentPackId): Promise<Set<string>> {
    const name = getContentCacheName(id);
    if (!(await this.cacheStorage.has(name))) return new Set();
    const keys = await (await this.cacheStorage.open(name)).keys();
    return new Set(keys.map((req) => req.url));
  }
}

function getStatus(cached: number, total: number): ContentPackStatus {
  if (total > 0 && cached >= total) return "installed";
  if (cached > 0) return "partial";
  return "pending";
}
