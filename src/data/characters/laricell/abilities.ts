import type { ActiveAbility } from "@/utils/types/player/abilities";
import {
  stackExplosionAbility,
  domainBurstAbility,
} from "@/data/characters/abilityFactories";

export const LARICELL_ACTIVE_ABILITIES: ActiveAbility[] = [
  stackExplosionAbility(),
  domainBurstAbility("laricell"),
];
