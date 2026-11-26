import type {
  ContentPackInfo,
  ContentStorageEstimate,
} from "@/services/content/contentPackService";
import type { ContentPackStatus } from "@/services/content/contentPackService";
import type { ContentDownloadState } from "@/hooks/menu/config/useContentPacks";
import { CONTENT_PACKS } from "@/data/content/packs";

import styles from "./styles.module.css";

type Props = {
  isSupported: boolean;
  packs: ContentPackInfo[];
  estimate: ContentStorageEstimate | null;
  downloading: ContentDownloadState | null;
  error: string | null;
  selectedIndex: number;
  isOnTab: boolean;
  onConfirmRow: (index: number) => void;
};

const STATUS_LABELS: Record<ContentPackStatus, string> = {
  installed: "Instalado",
  partial: "Parcial",
  pending: "Pendente",
};

function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * Texto da ação de cada linha, espelhando o que `confirmRow` fará. Ficam
 * juntos para o botão nunca prometer uma ação diferente da que o confirmar
 * do teclado executa.
 */
function getActionLabel(
  pack: ContentPackInfo,
  downloading: ContentDownloadState | null,
): string {
  if (downloading) return downloading.target === pack.id ? "Cancelar" : "";
  if (pack.status === "installed") return pack.removable ? "Remover" : "";
  return pack.status === "partial" ? "Continuar" : "Baixar";
}

/**
 * Aba "Conteúdo" das configurações: o que já está salvo no aparelho para
 * jogar offline, por pacote, com baixar/remover. O jogo continua carregando
 * sob demanda sem nada disso — a aba só antecipa o download.
 */
export function ContentTab({
  isSupported,
  packs,
  estimate,
  downloading,
  error,
  selectedIndex,
  isOnTab,
  onConfirmRow,
}: Props) {
  if (!isSupported) {
    return (
      <p className={styles.hint}>
        Este navegador não permite salvar o conteúdo para jogar offline.
      </p>
    );
  }

  const isRowSelected = (index: number) => !isOnTab && selectedIndex === index;
  const allIndex = CONTENT_PACKS.length;
  const pendingBytes = packs.reduce(
    (sum, p) => sum + (p.totalBytes - p.cachedBytes),
    0,
  );

  return (
    <div className={styles.container}>
      {estimate && (
        <p className={styles.hint}>
          Armazenamento usado: {formatBytes(estimate.usage)}
          {estimate.quota > 0 && ` de ${formatBytes(estimate.quota)}`}
        </p>
      )}
      {error && <p className={styles.error}>{error}</p>}

      <ul className={styles.list}>
        {packs.map((pack, index) => {
          const action = getActionLabel(pack, downloading);
          const progress =
            downloading?.id === pack.id ? downloading.progress : null;
          return (
            <li
              key={pack.id}
              className={`${styles.row} ${isRowSelected(index) ? styles.selected : ""}`}
            >
              <span className={styles.name}>{pack.label}</span>
              <span className={styles.size}>
                {formatBytes(pack.cachedBytes)} / {formatBytes(pack.totalBytes)}
              </span>
              <span className={`${styles.status} ${styles[pack.status]}`}>
                {progress
                  ? `${progress.done}/${progress.total}`
                  : STATUS_LABELS[pack.status]}
              </span>
              <button
                type="button"
                className={styles.action}
                disabled={!action}
                onClick={() => onConfirmRow(index)}
              >
                {action || "—"}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className={`${styles.allButton} ${isRowSelected(allIndex) ? styles.selected : ""}`}
        disabled={
          downloading ? downloading.target !== "all" : pendingBytes === 0
        }
        onClick={() => onConfirmRow(allIndex)}
      >
        {downloading?.target === "all"
          ? "Cancelar download"
          : `Baixar tudo (${formatBytes(pendingBytes)})`}
      </button>
    </div>
  );
}
