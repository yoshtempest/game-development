import { useEffect } from "react";
import type { BattleSocketMessage } from "@/hooks/useBattleSocket";

export function useBattleInputRelay({
  isHost,
  send,
  subscribe,
  enabled = true,
}: {
  isHost: boolean;
  send: (msg: BattleSocketMessage) => void;
  subscribe: (
    type: string,
    listener: (msg: BattleSocketMessage) => void,
  ) => () => void;
  /** Só o PvP compartilha um avatar; no co-op cada jogador move o seu. */
  enabled?: boolean;
}) {
  // Guest: envia inputs de teclado para o host
  useEffect(() => {
    if (!enabled || isHost) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      send({ type: "input", action: "keydown", code: e.code, key: e.key });
      // Evita que o controle local também aplique o movimento/ação.
      e.stopImmediatePropagation();
      e.preventDefault();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      send({ type: "input", action: "keyup", code: e.code, key: e.key });
      e.stopImmediatePropagation();
      e.preventDefault();
    };
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
    };
  }, [enabled, isHost, send]);

  // Host: aplica inputs remotos via eventos sintéticos. Por assinatura: dois
  // inputs no mesmo frame (keydown + keyup de um toque) sumiam com `lastMessage`.
  useEffect(() => {
    if (!enabled || !isHost) return;
    return subscribe("input", (msg) => {
      const code = (msg.code as string) ?? "";
      const key = (msg.key as string) ?? "";
      const action = (msg.action as string) ?? "";
      if (!code) return;
      const evt = new KeyboardEvent(
        action === "keyup" ? "keyup" : "keydown",
        { code, key, bubbles: true },
      );
      window.dispatchEvent(evt);
    });
  }, [enabled, isHost, subscribe]);
}
