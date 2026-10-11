import { PET_DROPS } from "@/data/characters/pets/petDrops";
import { getEquipmentById } from "@/data/equipment";

export function rollPetDrop(
  npcType: string,
  addDrop: (character: CharacterId, id: EquipmentId, enhance?: number) => void,
  character: CharacterId,
  petDropBonus: number = 1,
): EquipmentDropInfo | null {
  for (const [petId, info] of Object.entries(PET_DROPS)) {
    if (!npcType.startsWith(info.npcType)) continue;
    if (!info.chance) continue;
    if (Math.random() >= info.chance * petDropBonus) continue;

    const enhance = 0;
    addDrop(character, petId, enhance);
    const pet = getEquipmentById(petId);
    if (!pet) return null;

    return {
      id: pet.id,
      name: pet.name,
      slot: pet.slot,
      rank: pet.rank,
      enhance,
    };
  }

  return null;
}
