import { useEffect, useState } from "react";
import type { BattleSocketMessage } from "@/hooks/useBattleSocket";

export type BattleResult = "victory" | "defeat" | null;

export type BattleRewards = {
  xpReward?: number;
  lastRewards?: unknown;
};

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
  const [remoteRewards, setRemoteRewards] = useState<BattleRewards | null>(null);
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
      setRemoteRewards({
        xpReward: lastMessage.xpReward as number | undefined,
        lastRewards: lastMessage.lastRewards,
      });
    }
  }, [isHost, lastMessage]);

  const notifyResult = (result: BattleResult, rewards?: BattleRewards) => {
    if (!isHost) return;
    send({ type: "battleEnd", result, ...rewards });
  };

  return { remoteResult, remoteRewards, battleStarted, notifyResult };
}