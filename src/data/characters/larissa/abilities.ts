import type { ActiveAbility } from "@/utils/types/player/abilities";
import { stackExplosionAbility, domainBurstAbility } from "../abilityFactories";

export const LARISSA_ACTIVE_ABILITIES: ActiveAbility[] = [
  stackExplosionAbility(),
  domainBurstAbility("larissa"),
];
