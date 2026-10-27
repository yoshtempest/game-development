import type { ActiveAbility } from "@/utils/types/player/abilities";
import { domainBurstAbility } from "../abilityFactories";

export const MAYRA_ACTIVE_ABILITIES: ActiveAbility[] = [
  domainBurstAbility("mayra"),
];
