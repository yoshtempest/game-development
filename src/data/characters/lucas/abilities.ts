import type { ActiveAbility } from "@/utils/types/player/abilities";
import { weaponSwitchAbility, domainBurstAbility } from "../abilityFactories";

export const LUCAS_ACTIVE_ABILITIES: ActiveAbility[] = [
  weaponSwitchAbility(),
  domainBurstAbility("lucas"),
];
