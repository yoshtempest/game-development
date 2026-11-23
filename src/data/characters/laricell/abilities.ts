import type { ActiveAbility } from "@/utils/types/player/abilities";
import {
  stackExplosionAbility,
  domainBurstAbility,
  laricellIceWallAbility,
  laricellEarringsAbility,
  laricellSmokeBombAbility,
  laricellVampireFormAbility,
  laricellBiteAbility,
} from "@/data/characters/abilityFactories";

export const LARICELL_ACTIVE_ABILITIES: ActiveAbility[] = [
  stackExplosionAbility(),
  laricellIceWallAbility(),
  laricellEarringsAbility(),
  laricellSmokeBombAbility(),
  laricellVampireFormAbility(),
  laricellBiteAbility(),
  domainBurstAbility("laricell"),
];
