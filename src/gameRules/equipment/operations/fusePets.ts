import { getEquipmentById } from "@/data/equipment";
import { colKey, type CharacterEquipmentData } from "@/data/equipment/storage";
import {
  PET_STAR_MAX,
  enhanceFromPetStars,
} from "@/data/characters/pets/petProgress";
import { addToCollection } from "./addToCollection";
import { getMutableState } from "./getMutableState";

export function fusePets(
  allData: Record<string, CharacterEquipmentData>,
  character: CharacterId,
  petId: EquipmentId,
  stars: number,
): Record<string, CharacterEquipmentData> | null {
  const item = getEquipmentById(petId);
  if (!item || item.slot !== "pet") return null;
  if (stars < 1 || stars >= PET_STAR_MAX) return null;

  const sourceEnhance = enhanceFromPetStars(stars);
  const targetEnhance = sourceEnhance + 1;

  const { next, data, collection } = getMutableState(allData, character);

  const sourceKey = colKey(petId, sourceEnhance);
  const collectionCount = collection[sourceKey] ?? 0;
  const equippedPet = data.equipped.pet;
  const equippedMatches =
    equippedPet &&
    equippedPet.id === petId &&
    equippedPet.enhance === sourceEnhance;
  const totalCount = collectionCount + (equippedMatches ? 1 : 0);

  if (totalCount < 2) return null;

  const equipped = { ...data.equipped };

  if (equippedMatches) {
    const fromCollection = Math.min(collectionCount, 2);
    const fromEquipped = 2 - fromCollection;
    const remaining = collectionCount - fromCollection;
    if (remaining > 0) {
      collection[sourceKey] = remaining;
    } else {
      delete collection[sourceKey];
    }
    if (fromEquipped > 0) {
      equipped.pet = null;
    }
  } else {
    collection[sourceKey] = (collection[sourceKey] ?? 0) - 2;
    if ((collection[sourceKey] ?? 0) <= 0) delete collection[sourceKey];
  }

  addToCollection(collection, petId, targetEnhance);

  next[character] = {
    equipped,
    collection,
  };
  return next;
}
