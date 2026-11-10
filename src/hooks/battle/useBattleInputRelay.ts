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
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      send({ type: "input", action: "keyup", code: e.code, key: e.key });
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
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