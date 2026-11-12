import { useCallback, useEffect, useState } from "react";
import type { BattleSocketMessage } from "@/hooks/useBattleSocket";

export type BattleResult = "victory" | "defeat" | null;

export type BattleRewards = {
  xpReward?: number;
  lastRewards?: unknown;
};

type Subscribe = (
  type: string,
  listener: (msg: BattleSocketMessage) => void,
) => () => void;

/**
 * Resultado da batalha anunciado pelo líder. A recepção é por assinatura: com
 * `lastMessage` um `battleSnapshot` (20 Hz) chegando logo depois engolia o
 * `battleEnd` e o guest ficava preso na arena.
 */
export function useBattleLifecycle({
  isHost,
  send,
  subscribe,
}: {
  isHost: boolean;
  send: (msg: BattleSocketMessage) => void;
  subscribe: Subscribe;
}) {
  const [remoteResult, setRemoteResult] = useState<BattleResult>(null);
  const [remoteRewards, setRemoteRewards] = useState<BattleRewards | null>(
    null,
  );

  useEffect(() => {
    if (isHost) return;
    return subscribe("battleEnd", (msg) => {
      setRemoteResult((msg.result as BattleResult) ?? null);
      setRemoteRewards({
        xpReward: msg.xpReward as number | undefined,
        lastRewards: msg.lastRewards,
      });
    });
  }, [isHost, subscribe]);

  const notifyResult = useCallback(
    (result: BattleResult, rewards?: BattleRewards) => {
      if (!isHost) return;
      send({ type: "battleEnd", result, ...rewards });
    },
    [isHost, send],
  );

  /** Limpa o resultado recebido quando o líder reinicia a luta. */
  const clearRemoteResult = useCallback(() => {
    setRemoteResult(null);
    setRemoteRewards(null);
  }, []);

  return { remoteResult, remoteRewards, notifyResult, clearRemoteResult };
}
