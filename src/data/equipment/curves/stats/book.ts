import type {
  EquipmentRank,
  EquipmentStats,
} from "@/utils/types/player/equipment";
import type { BookFlavor } from "../types";
import { WEAPONS } from "../constants";

/** Livros: `erudito` (espírito+cooldown), `selo` (espírito+escudo), `profecia` (espírito+dano verdadeiro/% vida). */
export function bookStats(
  rank: EquipmentRank,
  flavor: BookFlavor,
): Partial<EquipmentStats> {
  const spirit = WEAPONS.BOOKS.SPIRIT[rank];
  if (flavor === "erudito") {
    return { spirit, cooldownReduction: WEAPONS.BOOKS.CDR[rank] };
  }
  if (flavor === "selo") {
    return { spirit, shield: WEAPONS.BOOKS.SHIELD[rank] };
  }
  return {
    spirit,
    trueDamage: WEAPONS.BOOKS.TRUE[rank],
    maxHpDamage: WEAPONS.BOOKS.MAX_HP[rank],
  };
}