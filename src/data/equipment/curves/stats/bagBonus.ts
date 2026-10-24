import type { EquipmentRank } from "@/utils/types/player/equipment";
import { BAG_SLOTS } from "@/data/equipment/curves/constants";

export function bagBonusSlots(rank: EquipmentRank): number {
  return BAG_SLOTS[rank];
}
