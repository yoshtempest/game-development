import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ContentPackService } from "@/services/content/contentPackService";
import type {
  ContentPackInfo,
  ContentStorageEstimate,
  DownloadProgress,
} from "@/services/content/contentPackService";
import { CONTENT_PACKS } from "@/data/content/packs";
import type { ContentPackId } from "@/data/content/packs";

/**
 * `target` é o que o jogador pediu (um pacote ou "all"); `id` é o pacote que
 * está baixando agora — no "Baixar tudo" eles diferem e a tela mostra os dois.
 */
export type ContentDownloadState = {
  target: ContentPackId | "all";
  id: ContentPackId;
  progress: DownloadProgress;
};

/**
 * Estado da aba "Conteúdo" das configurações.
 *
 * Só um download por vez: pacotes grandes (Personagens passa de 600 MB)
 * disputando as mesmas seis conexões só atrasariam os dois e o carregamento
 * da cena atual. O download é abortado no unmount — fechar o menu cancela o
 * que estava em curso, e o que já foi gravado fica (o próximo download
 * retoma do que falta).
 */
export function useContentPacks(isActive: boolean) {
  const service = useMemo(
    () =>
      typeof caches === "undefined"
        ? null
        : new ContentPackService(
            caches,
            fetch.bind(window),
            import.meta.env.BASE_URL,
            window.location.origin,
          ),
    [],
  );

  const [packs, setPacks] = useState<ContentPackInfo[]>([]);
  const [estimate, setEstimate] = useState<ContentStorageEstimate | null>(null);
  const [downloading, setDownloading] = useState<ContentDownloadState | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (!service) return;
    try {
      const [list, est] = await Promise.all([
        service.listPacks(),
        service.estimate(),
      ]);
      setPacks(list);
      setEstimate(est);
      setError(null);
    } catch {
      setError("Não foi possível ler a lista de conteúdo. Tente online.");
    }
  }, [service]);

  useEffect(() => {
    if (!isActive) return;
    void refresh();
  }, [isActive, refresh]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const runDownload = useCallback(
    async (target: ContentPackId | "all") => {
      if (!service || abortRef.current) return;
      const controller = new AbortController();
      abortRef.current = controller;
      await service.requestPersistence();

      const ids = target === "all" ? CONTENT_PACKS.map((p) => p.id) : [target];
      try {
        for (const id of ids) {
          if (controller.signal.aborted) break;
          await service.download(id, controller.signal, (progress) =>
            setDownloading({ target, id, progress }),
          );
        }
      } catch {
        setError("Falha ao baixar. Verifique a conexão e tente de novo.");
      } finally {
        abortRef.current = null;
        if (!controller.signal.aborted) {
          setDownloading(null);
          await refresh();
        }
      }
    },
    [service, refresh],
  );

  const cancelDownload = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setDownloading(null);
    void refresh();
  }, [refresh]);

  const removePack = useCallback(
    async (id: ContentPackId) => {
      if (!service) return;
      await service.remove(id);
      await refresh();
    },
    [service, refresh],
  );

  /**
   * Ação de confirmar na linha `index`: baixa o que falta, remove o pacote
   * instalado ou cancela o download em curso. A última linha é "Baixar
   * tudo". Pacote essencial instalado não tem ação — não é removível.
   */
  const confirmRow = useCallback(
    (index: number) => {
      if (downloading) {
        const targetIndex =
          downloading.target === "all"
            ? CONTENT_PACKS.length
            : CONTENT_PACKS.findIndex((p) => p.id === downloading.target);
        if (index === targetIndex) cancelDownload();
        return;
      }
      if (index === CONTENT_PACKS.length) {
        void runDownload("all");
        return;
      }
      const pack = packs[index];
      if (!pack) return;
      if (pack.status === "installed") {
        if (pack.removable) void removePack(pack.id);
        return;
      }
      void runDownload(pack.id);
    },
    [downloading, packs, cancelDownload, runDownload, removePack],
  );

  return {
    isSupported: service !== null,
    packs,
    estimate,
    downloading,
    error,
    confirmRow,
  };
}
