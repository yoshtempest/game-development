import { usePWA } from "@/contexts/PWAContext";
import styles from "./styles.module.css";
import { Download } from "lucide-react";

/**
 * Returns the install instructions that match the platform the player is on.
 *
 * iOS Safari never fires `beforeinstallprompt` and Android Chromium forks strip
 * it, so both need prose instead of a button — and the prose differs. Sending
 * an iPhone user to the "⋮" menu, as the single generic message used to, points
 * at a control that does not exist on their browser.
 */
function useInstructions(): string {
  const { isIOS, isManualAndroid } = usePWA();

  if (isIOS) {
    return 'Toque em Compartilhar (↗) na barra do Safari e escolha "Adicionar à Tela de Início".';
  }

  if (isManualAndroid) {
    return 'Abra o menu do navegador (⋮) e escolha "Instalar app" ou "Adicionar à tela inicial".';
  }

  return 'Use o menu do navegador (⋮ ou ↗) e selecione "Instalar app" ou "Adicionar à tela inicial".';
}

export default function InstallButton() {
  const {
    showInstalledMessage,
    setShowInstalledMessage,
    showInstructions,
    setShowInstructions,
    openInChromeIntent,
  } = usePWA();

  const instructions = useInstructions();

  return (
    <>
      <div className="navbarContainerRow">
        <Download />
        <h2>Instalar app</h2>
      </div>
      {showInstalledMessage && (
        <div className="overlay" onClick={() => setShowInstalledMessage(false)}>
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <p>Você já tem o app Jomásio Adventures instalado.</p>
            <button
              type="button"
              className={styles.popupButton}
              onClick={() => setShowInstalledMessage(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
      {showInstructions && (
        <div
          className={styles.overlay}
          onClick={() => setShowInstructions(false)}
        >
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <p>{instructions}</p>
            {openInChromeIntent && (
              <a className={styles.popupButton} href={openInChromeIntent}>
                Abrir no Chrome
              </a>
            )}
            <button
              type="button"
              className={styles.popupButton}
              onClick={() => setShowInstructions(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
