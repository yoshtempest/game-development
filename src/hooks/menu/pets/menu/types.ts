import type { EquipmentRank } from "@/utils/types/player/equipment";
import { type PetRole } from "@/data/characters/pets/petSkills";

export type PetEntry = {
  id: EquipmentId;
  name: string;
  rank: EquipmentRank;
  role: PetRole;
  skillName: string;
  passiveName: string;
  owned: boolean;
  qtyByStar: number[];
  dropNpc: string | null;
  dropLabel: string | null;
  dropChance: number | null;
  riddle: string | null;
  location: string | null;
};
