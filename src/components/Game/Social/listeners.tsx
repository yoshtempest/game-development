import { useEffect } from "react";

// Arrays fora do componente: recriá-los a cada render fazia o efeito ser
// remontado (e o listener perdido) sem nenhuma mudança real de dependência.
const ENTER_KEYS = ["Enter", "l", "L"];
const CANCEL_KEYS = ["Escape", "b", "B"];

export function EnterListener({ onEnter }: { onEnter: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (ENTER_KEYS.includes(e.key)) onEnter();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onEnter]);
  return null;
}

export function CancelListener({ onCancel }: { onCancel: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (CANCEL_KEYS.includes(e.key)) onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);
  return null;
}
