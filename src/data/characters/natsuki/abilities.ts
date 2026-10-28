import type { ActiveAbility } from "@/utils/types/player/abilities";
import {
  divergentFistAbility,
  blinkAbility,
  cursedEnergyConversionAbility,
  blueSphereAbility,
  redSphereAbility,
  purpleSphereAbility,
  muryokushoAbility,
} from "@/data/characters/abilityFactories";

export const NATSUKI_ACTIVE_ABILITIES: ActiveAbility[] = [
  divergentFistAbility(),
  blinkAbility(),
  cursedEnergyConversionAbility(),
  blueSphereAbility(),
  redSphereAbility(),
  purpleSphereAbility(),
  muryokushoAbility("natsuki"),
];
