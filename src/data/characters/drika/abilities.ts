import type { ActiveAbility } from "@/utils/types/player/abilities";
import {
  domainBurstAbility,
  sigiloAbility,
} from "@/data/characters/abilityFactories";

export const DRIKA_ACTIVE_ABILITIES: ActiveAbility[] = [
  domainBurstAbility("drika"),
  sigiloAbility(),
];
