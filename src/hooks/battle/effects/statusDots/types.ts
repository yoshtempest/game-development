import type { BattleManaApi } from "@/contexts/BattleManaContext";

import type { SpawnDamageFn } from "@/utils/types/battle/spawnDamageFn";
import type { Enchantment } from "@/data/equipment/enchantments";
import type { RefObject } from "react";

export type Props = {
  honoredRegenActive: boolean;
  battleManaRef: RefObject<BattleManaApi | null>;
  isEndingRef: RefObject<{ current: boolean }>;
  isPausedRef: RefObject<boolean>;
  setSummons: React.Dispatch<React.SetStateAction<SummonedNpc[]>>;
  summonsBleedUntilRef: RefObject<Record<string, number>>;
  summons: SummonedNpc[];
  setNpcHP: React.Dispatch<React.SetStateAction<number>>;
  npcX: number;
  npcY: number;
  spawnDamageRef: RefObject<SpawnDamageFn>;
  npcEnchantUntilRef: RefObject<Record<Enchantment, number>>;
};
