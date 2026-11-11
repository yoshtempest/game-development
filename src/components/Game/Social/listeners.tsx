import { useEffect } from "react";

export function EnterListener({ onEnter }: { onEnter: () => void }) {
  const enter = ["Enter", "l", "L"];
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (enter.includes(e.key)) onEnter();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onEnter]);
  return null;
}

export function CancelListener({ onCancel }: { onCancel: () => void }) {
  useEffect(() => {
    const escape = ["Escape", "b", "B"];
    const handler = (e: KeyboardEvent) => {
      if (escape.includes(e.key)) onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);
  return null;
}