import type { ActiveAbility } from "@/utils/types/player/abilities";
import {
  divergentFistAbility,
  blinkAbility,
  cursedEnergyConversionAbility,
  blueSphereAbility,
  redSphereAbility,
  purpleSphereAbility,
  muryokushoAbility,
} from "../abilityFactories";

export const RIQUELME_ACTIVE_ABILITIES: ActiveAbility[] = [
  divergentFistAbility(),
  blinkAbility(),
  cursedEnergyConversionAbility(),
  blueSphereAbility(),
  redSphereAbility(),
  purpleSphereAbility(),
  muryokushoAbility("riquelme"),
];
