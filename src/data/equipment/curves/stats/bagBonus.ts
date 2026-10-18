import type {
  EquipmentRank,
} from "@/utils/types/player/equipment";
import { BAG_SLOTS } from "../constants";

export function bagBonusSlots(rank: EquipmentRank): number {
  return BAG_SLOTS[rank];
}