import type { ActiveAbility } from "@/utils/types/player/abilities";
import {
  weaponSwitchAbility,
  domainBurstAbility,
} from "@/data/characters/abilityFactories";

export const YVEL_ACTIVE_ABILITIES: ActiveAbility[] = [
  weaponSwitchAbility(),
  domainBurstAbility("yvel"),
];
