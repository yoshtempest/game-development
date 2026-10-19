import type {
  EquipmentRank,
  EquipmentStats,
} from "@/utils/types/player/equipment";
import type { ArmorFlavor, ArmorSlot } from "../types";
import { ARMOR_CURVE, PIECES } from "../constants";

/**
 * Estatísticas de uma peça de armadura.
 * - `guardiao`: armadura cheia, sem bônus.
 * - `robusto`: ~80% da armadura + vida.
 * - `agil`: ~60% da armadura + meia vida + técnica.
 * Reflexo (rank 6+) entra em todos os perfis — nas peças antigas era padrão.
 */
export function armorStats(
  slot: ArmorSlot,
  rank: EquipmentRank,
  flavor: ArmorFlavor,
): Partial<EquipmentStats> {
  const base = ARMOR_CURVE[slot][rank];
  const reflect = PIECES.REFLECT[rank];
  if (flavor === "guardiao") {
    return { armor: base, ...(reflect > 0 ? { reflect } : {}) };
  }
  if (flavor === "robusto") {
    return {
      armor: Math.round(base * 0.8),
      hp: PIECES.HP[rank],
      ...(reflect > 0 ? { reflect } : {}),
    };
  }
  return {
    armor: Math.round(base * 0.6),
    hp: Math.max(1, Math.ceil(PIECES.HP[rank] / 2)),
    technique: PIECES.TECHNIQUE[rank],
    ...(reflect > 0 ? { reflect } : {}),
  };
}