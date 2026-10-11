import type {
  PetAbilityInfo,
  PetPassiveEffect,
  PetRole,
  PetSkillDefinition,
  PetSkillEffect,
} from "./types";

const BATTLE_SPRITES = new Set([
  "hungryKing",
  "piupiu",
  "leviathan",
  "hungryDeath",
]);

export function def(
  petId: string,
  name: string,
  npcType: string,
  role: PetRole,
  passive: PetAbilityInfo,
  skill: PetAbilityInfo,
  skillEffect: PetSkillEffect,
  passiveEffect?: PetPassiveEffect,
): PetSkillDefinition {
  return {
    petId,
    name,
    role,
    npcType,
    battleSprite: BATTLE_SPRITES.has(npcType) ? npcType : "goat",
    passive,
    passiveEffect,
    skill,
    skillEffect,
  };
}

export function getPetRoleFromSkills(
  petId: string,
  skills: Record<string, PetSkillDefinition>,
): PetRole {
  return skills[petId]?.role ?? "dano";
}

export function isBattlePetFromSkills(
  petId: string,
  skills: Record<string, PetSkillDefinition>,
): boolean {
  return getPetRoleFromSkills(petId, skills) !== "montaria";
}
