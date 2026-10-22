import { getPetRoleFromSkills, isBattlePetFromSkills } from "./helpers";
import type { PetSkillDefinition, PetRole } from "./types";

import { pet_rapariga } from "./pets/rapariga";
import { pet_crocodile } from "./pets/crocodile";
import { pet_lupita } from "./pets/lupita";
import { pet_duque } from "./pets/duque";
import { pet_goat } from "./pets/goat";
import { pet_hungryDeath } from "./pets/hungryDeath";
import { pet_hungryKing } from "./pets/hungryKing";
import { pet_leviathan } from "./pets/leviathan";
import { pet_madame } from "./pets/madame";
import { pet_mosquito } from "./pets/mosquito";
import { pet_piupiu } from "./pets/piupiu";
import { pet_turkey } from "./pets/turkey";
import { pet_vulture } from "./pets/vulture";

export const PET_SKILLS: Record<string, PetSkillDefinition> = {
  [pet_turkey.petId]: pet_turkey,
  [pet_crocodile.petId]: pet_crocodile,
  [pet_lupita.petId]: pet_lupita,
  [pet_rapariga.petId]: pet_rapariga,
  [pet_goat.petId]: pet_goat,
  [pet_duque.petId]: pet_duque,
  [pet_leviathan.petId]: pet_leviathan,
  [pet_hungryDeath.petId]: pet_hungryDeath,
  [pet_piupiu.petId]: pet_piupiu,
  [pet_vulture.petId]: pet_vulture,
  [pet_hungryKing.petId]: pet_hungryKing,
  [pet_madame.petId]: pet_madame,
  [pet_mosquito.petId]: pet_mosquito,
};

export function getPetSkillDefinition(
  petId: string,
): PetSkillDefinition | null {
  return PET_SKILLS[petId] ?? null;
}

export function getPetRole(petId: string): PetRole {
  return getPetRoleFromSkills(petId, PET_SKILLS);
}

export function isBattlePet(petId: string): boolean {
  return isBattlePetFromSkills(petId, PET_SKILLS);
}
