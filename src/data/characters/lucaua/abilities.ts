import type { ActiveAbility } from "@/utils/types/player/abilities";
import { dimensionalPortalAbility, domainBurstAbility } from "../abilityFactories";

export const LUCAUA_ACTIVE_ABILITIES: ActiveAbility[] = [
  dimensionalPortalAbility(),
  domainBurstAbility("lucaua"),
];
