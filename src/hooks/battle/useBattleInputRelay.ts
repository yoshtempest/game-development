import { useEffect } from "react";
import type { BattleSocketMessage } from "@/hooks/useBattleSocket";

export function useBattleInputRelay({
  isHost,
  send,
  lastMessage,
}: {
  isHost: boolean;
  send: (msg: BattleSocketMessage) => void;
  lastMessage: BattleSocketMessage | null;
}) {
  // Guest: envia inputs de teclado para o host
  useEffect(() => {
    if (isHost) return;
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
  }, [isHost, send]);

  // Host: aplica inputs remotos via eventos sintéticos
  useEffect(() => {
    if (!isHost) return;
    if (!lastMessage || lastMessage.type !== "input") return;
    const code = (lastMessage.code as string) ?? "";
    const key = (lastMessage.key as string) ?? "";
    const action = (lastMessage.action as string) ?? "";
    if (!code) return;
    const evt = new KeyboardEvent(action === "keyup" ? "keyup" : "keydown", {
      code,
      key,
      bubbles: true,
    });
    window.dispatchEvent(evt);
  }, [isHost, lastMessage]);
}