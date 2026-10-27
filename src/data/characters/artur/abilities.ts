import type { ActiveAbility } from "@/utils/types/player/abilities";
import { killerQueenAbility, domainBurstAbility } from "../abilityFactories";

export const ARTUR_ACTIVE_ABILITIES: ActiveAbility[] = [
  killerQueenAbility(),
  domainBurstAbility("artur"),
];
