import type { useNpcAI } from "@/hooks/battle/npc/ai/useAi";
import type { useBattleSystem } from "@/hooks/battle/main/battleSystem/useSystem";
import type { ComboRank } from "@/utils/types/battle/combo";

export type Props = {
  player: Player;
  npc: ReturnType<typeof useNpcAI>;
  battle: ReturnType<typeof useBattleSystem>;
  comboCount: number;
  comboRank: ComboRank;
  comboProgress: number;
  nextRank: ComboRank | null;
  summons: SummonedNpc[];
  controlsDisabled: boolean;
};
