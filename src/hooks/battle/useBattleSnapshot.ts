import { useEffect } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import type { BattleSocketMessage } from "@/hooks/useBattleSocket";
import type { NPCBattleState, NPCDirection } from "@/utils/types/npc/npc";

export type BattleSnapshot = {
  t: number;
  player?: {
    x: number;
    y: number;
    hp: number;
    state?: PlayerState;
    /** Direção do avatar remoto (o sprite não pode ficar fixo em "down"). */
    direction?: Direction;
    character?: string;
  };
  npc?: {
    x: number;
    y: number;
    hp: number;
    state?: NPCBattleState["state"];
    direction?: NPCDirection;
    hidden?: boolean;
    phase?: number;
    /**
     * Projéteis ativos do NPC. O guest não simula projétil: ele desenha os do
     * líder, que é quem resolve colisão e dano.
     */
    projectiles?: Projectile[];
  };
};

/**
 * Envio do snapshot do líder. A recepção vive no `useBattleNet` (montado antes
 * da cena), porque o alvo remoto precisa existir já para a IA do NPC.
 */
export function useBattleSnapshot({
  isHost,
  send,
  getState,
}: {
  isHost: boolean;
  send: (msg: BattleSocketMessage) => void;
  getState: () => BattleSnapshot;
}) {
  // `getState` é recriado a cada render do chamador. Sem o ref, o effect
  // reiniciava o intervalo a cada frame e ele nunca chegava a disparar.
  const getStateRef = useLatestRef(getState);

  useEffect(() => {
    if (!isHost) return;
    // 50 ms: projéteis andam rápido e a 10 Hz o guest via o tiro "pulando".
    const id = setInterval(() => {
      send({ type: "battleSnapshot", ...(getStateRef.current() as object) });
    }, 50);
    return () => clearInterval(id);
  }, [isHost, send, getStateRef]);
}
