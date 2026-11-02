import type { NPCBattleState } from "@/utils/types/npc/npc";

export type Props = {
  npcPhase: number;
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  npc: NPCBattleState & {
    updateNpc: (data: Partial<NPCBattleState>) => void;
    resetNpc: (stateOverride?: NPCBattleState["state"]) => void;
  };
  clearSummons: () => void;
  clearAllies: () => void;
  setIsPhaseTransitioning: (v: boolean) => void;
  disabled?: boolean;
};
