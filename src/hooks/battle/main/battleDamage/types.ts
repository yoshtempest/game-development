import type { RefObject } from "react";
import type { useBattleRefs } from "@/hooks/battle/utilities/useRefs";
import type { useBattleStageSetup } from "@/hooks/battle/useBattleStageSetup";
import type { useBattleSystem } from "@/hooks/battle/main/battleSystem/useSystem";
import type { useNpcAI } from "@/hooks/battle/npc/ai/useAi";
import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { Enchantment } from "@/data/equipment/enchantments";

/**
 * Contratos do pipeline de dano da batalha (`useBattleDamage`): a entrada
 * única do jogador (`registerHitRef`) e os gatilhos de dano especial/área que
 * disparam `playerHit`/`damageSummon`.
 */
export type BattleDamageProps = {
  battle: ReturnType<typeof useBattleSystem>;
  registerHit: (damage: number) => void;
  refs: ReturnType<typeof useBattleRefs>;
  npc: ReturnType<typeof useNpcAI>;
  player: Player;
  playerClass: PlayerClass;
  progress: ReturnType<typeof useBattleStageSetup>["progress"];
  summons: ReturnType<typeof useBattleStageSetup>["summons"];
  setSummons: ReturnType<typeof useBattleStageSetup>["setSummons"];
  giveSummonRewards: ReturnType<
    typeof useBattleStageSetup
  >["giveSummonRewards"];
  battleManaRef: RefObject<BattleManaApi | null>;
  cursedEnergyEnabled: boolean;
  vastolordActive: boolean;
  extendVastolordRef: RefObject<(ms: number) => void>;
  weaponEnchantmentRef: RefObject<Enchantment | null>;
  npcEnchantUntilRef: RefObject<Record<Enchantment, number>>;
};
