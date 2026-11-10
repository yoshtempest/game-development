import { useEffect, useState } from "react";
import type { BattleSocketMessage } from "@/hooks/useBattleSocket";

export type BattleResult = "victory" | "defeat" | null;

export function useBattleLifecycle({
  isHost,
  send,
  lastMessage,
}: {
  isHost: boolean;
  send: (msg: BattleSocketMessage) => void;
  lastMessage: BattleSocketMessage | null;
}) {
  const [remoteResult, setRemoteResult] = useState<BattleResult>(null);
  const [battleStarted, setBattleStarted] = useState(false);

  // Host: anuncia início
  useEffect(() => {
    if (!isHost) return;
    send({ type: "battleStart" });
  }, [isHost, send]);

  // Guest: recebe início
  useEffect(() => {
    if (isHost) return;
    if (lastMessage?.type === "battleStart") setBattleStarted(true);
  }, [isHost, lastMessage]);

  // Guest: recebe resultado
  useEffect(() => {
    if (isHost) return;
    if (lastMessage?.type === "battleEnd") {
      setRemoteResult((lastMessage.result as BattleResult) ?? null);
    }
  }, [isHost, lastMessage]);

  const notifyResult = (result: BattleResult) => {
    if (!isHost) return;
    send({ type: "battleEnd", result });
  };

  return { remoteResult, battleStarted, notifyResult };
}