import type { ActiveAbility } from "@/utils/types/player/abilities";
import { domainBurstAbility } from "../abilityFactories";

export const LEVI_ACTIVE_ABILITIES: ActiveAbility[] = [
  domainBurstAbility("levi"),
];
