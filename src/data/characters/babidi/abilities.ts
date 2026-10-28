import type { ActiveAbility } from "@/utils/types/player/abilities";
import {
  dimensionalPortalAbility,
  domainBurstAbility,
} from "@/data/characters/abilityFactories";

export const BABIDI_ACTIVE_ABILITIES: ActiveAbility[] = [
  dimensionalPortalAbility(),
  domainBurstAbility("babidi"),
];
