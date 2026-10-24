import type {
  EquipmentRank,
  EquipmentStats,
} from "@/utils/types/player/equipment";
import type { BowFlavor } from "@/data/equipment/curves/types";
import { WEAPONS } from "@/data/equipment/curves/constants";

/** Arcos: `longo` (técnica+força), `pontaria` (téc+força+dano verdadeiro), `perfurante` (téc+força+% vida máxima). */
export function bowStats(
  rank: EquipmentRank,
  flavor: BowFlavor,
): Partial<EquipmentStats> {
  const technique = WEAPONS.BOWS.TEC[rank];
  const strength = WEAPONS.BOWS.STR[rank];
  if (flavor === "longo") {
    return { technique, strength };
  }
  if (flavor === "pontaria") {
    return { technique, strength, trueDamage: WEAPONS.BOWS.TRUE[rank] };
  }
  return { technique, strength, maxHpDamage: WEAPONS.BOWS.MAX_HP[rank] };
}
