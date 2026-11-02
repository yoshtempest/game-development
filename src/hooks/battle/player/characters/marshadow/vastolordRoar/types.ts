import type { NPCBattleState } from "@/utils/types/npc/npc";
import type { Dispatch, SetStateAction } from "react";

export type Props = {
  /** Quadro da transformação (0=screamOne … 3=transformated) ou `null`. */
  transformationFrame: number | null;
  /** X do jogador — origem do empurrão (o Vastolord grita parado). */
  playerX: number;
  /** NPC principal: estado lido via ref; `setNpc` aplica o empurrão. */
  npc: {
    x: number;
    setNpc: Dispatch<SetStateAction<NPCBattleState>>;
  };
  setSummons: Dispatch<SetStateAction<SummonedNpc[]>>;
};
