import type {
  EquipmentRank,
  EquipmentStats,
} from "@/utils/types/player/equipment";
import { PIECES, ACCESSORIES } from "../constants";

type AccessoryFlavor = "guerreiro" | "arcano" | "nomade";

/**
 * Acessórios — três perfis:
 * - `guerreiro`: força + técnica (anel do guerreiro).
 * - `arcano`: espírito (pingente/colar do conjurador).
 * - `nomade`: defesa e cooldown puros, sem stat ofensivo.
 * Todos levam vida + escudo + CDR em escalas menores.
 */
export function accessoryStats(
  rank: EquipmentRank,
  flavor: AccessoryFlavor,
): Partial<EquipmentStats> {
  const hp = PIECES.HP[rank];
  const shield = ACCESSORIES.SHIELD[rank];
  const cdr = ACCESSORIES.CDR[rank];
  // O guerreiro usa a armadura cheia (é o anel de armadura dos ranks antigos);
  // os outros perfis dividem por 2 — o foco deles é outro.
  const baseArmor = ACCESSORIES.ARMOR[rank];
  const armor = Math.max(1, Math.floor(baseArmor / 2));
  if (flavor === "guerreiro") {
    return {
      hp,
      shield,
      cooldownReduction: cdr,
      armor: baseArmor,
      strength: ACCESSORIES.STR[rank],
      technique: ACCESSORIES.TEC[rank],
    };
  }
  if (flavor === "arcano") {
    return {
      hp,
      shield,
      cooldownReduction: cdr,
      armor,
      spirit: ACCESSORIES.SPIRIT[rank],
    };
  }
  return { hp, shield, cooldownReduction: cdr, armor };
}