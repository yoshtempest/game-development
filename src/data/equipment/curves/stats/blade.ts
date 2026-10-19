import type {
  EquipmentRank,
  EquipmentStats,
} from "@/utils/types/player/equipment";
import type { BladeFlavor } from "../types";
import { WEAPONS } from "../constants";

/** Lâminas: `aco` (força+técnica), `sangue` (força+vampirismo+dano verdadeiro), `cortante` (força+técnica+dano verdadeiro). */
export function bladeStats(
  rank: EquipmentRank,
  flavor: BladeFlavor,
): Partial<EquipmentStats> {
  const strength = WEAPONS.BLADES.STR[rank];
  if (flavor === "aco") {
    return { strength, technique: WEAPONS.BLADES.TEC[rank] };
  }
  if (flavor === "sangue") {
    return {
      strength,
      vampirism: WEAPONS.BLADES.VAMP[rank],
      trueDamage: WEAPONS.BLADES.TRUE[rank],
    };
  }
  return {
    strength,
    technique: WEAPONS.BLADES.TEC[rank],
    trueDamage: WEAPONS.BLADES.TRUE[rank],
    maxHpDamage: WEAPONS.BLADES.MAX_HP[rank],
  };
}