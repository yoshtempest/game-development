import type { ActiveAbility } from "@/utils/types/player/abilities";
import {
  killerQueenAbility,
  domainBurstAbility,
} from "@/data/characters/abilityFactories";

export const SR_GUAXINIM_ACTIVE_ABILITIES: ActiveAbility[] = [
  killerQueenAbility(),
  domainBurstAbility("srGuaxinim"),
];
