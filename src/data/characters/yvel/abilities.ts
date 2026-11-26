import type { ActiveAbility } from "@/utils/types/player/abilities";
import {
  weaponSwitchAbility,
  unlimitedBladeWorksAbility,
} from "@/data/characters/abilityFactories";

export const YVEL_ACTIVE_ABILITIES: ActiveAbility[] = [
  weaponSwitchAbility(),
  unlimitedBladeWorksAbility(),
];
