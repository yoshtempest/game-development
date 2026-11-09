import { useEffect, useState } from "react";
import { useToastQueue, type Toast } from "@/contexts/ToastContext";

import styles from "./styles.module.css";

type ToastEntryProps = {
  toast: Toast;
  onDismiss: (id: number) => void;
};

function ToastEntry({ toast, onDismiss }: ToastEntryProps) {
  const [src, setSrc] = useState(toast.icon);
  const [broken, setBroken] = useState(false);

  // Troca de toast no mesmo slot (impossível hoje, mas barato): reseta o
  // estado do ícone para não herdar o fallback da imagem anterior.
  useEffect(() => {
    setSrc(toast.icon);
    setBroken(false);
  }, [toast.icon]);

  function handleIconError() {
    if (toast.iconFallback && src !== toast.iconFallback) {
      setSrc(toast.iconFallback);
      return;
    }
    // Sem imagem válida o texto segue centralizado: o ícone é absoluto e
    // não desloca o layout.
    setBroken(true);
  }

  return (
    <div className={styles.toast} onClick={() => onDismiss(toast.id)}>
      {!broken && (
        <img loading="lazy" decoding="async"
          className={styles.icon}
          src={src}
          alt=""
          onError={handleIconError}
        />
      )}
      <span className={styles.text}>{toast.text}</span>
    </div>
  );
}

export function ToastStack() {
  const { toasts, dismissToast } = useToastQueue();

  if (toasts.length === 0) return null;

  return (
    <div className={styles.stack} aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <ToastEntry key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
