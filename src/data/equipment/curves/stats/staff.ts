import type {
  EquipmentRank,
  EquipmentStats,
} from "@/utils/types/player/equipment";
import type { StaffFlavor } from "../types";
import { WEAPONS } from "../constants";

/** Cajados: `runico` (espírito+escudo), `real` (espírito+força+vampirismo), `ancestral` (espírito+escudo+dano verdadeiro/% vida). */
export function staffStats(
  rank: EquipmentRank,
  flavor: StaffFlavor,
): Partial<EquipmentStats> {
  const spirit = WEAPONS.STAFFS.SPIRIT[rank];
  if (flavor === "runico") {
    return { spirit, shield: WEAPONS.STAFFS.SHIELD[rank] };
  }
  if (flavor === "real") {
    return { spirit, strength: WEAPONS.STAFFS.STR[rank], vampirism: WEAPONS.STAFFS.VAMP[rank] };
  }
  return {
    spirit,
    shield: WEAPONS.STAFFS.SHIELD[rank],
    trueDamage: WEAPONS.STAFFS.TRUE[rank],
    maxHpDamage: WEAPONS.STAFFS.MAX_HP[rank],
  };
}