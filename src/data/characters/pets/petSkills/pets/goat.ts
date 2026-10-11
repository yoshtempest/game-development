import { PET_SKILL_COOLDOWN_MS } from "@/data/characters/pets/petSkills/constants";
import { def } from "@/data/characters/pets/petSkills/helpers";
import type { PetSkillDefinition } from "@/data/characters/pets/petSkills/types";

export const pet_goat: PetSkillDefinition = def(
  "pet_goat",
  "Bodão",
  "goat",
  "dano",
  {
    name: "Cabeçada",
    description: "Ataca com uma cabeçada firme.",
    cooldownMs: PET_SKILL_COOLDOWN_MS,
  },
  {
    name: "Investida Bruta",
    description: "Pula em direção ao inimigo causando dano triplo.",
    cooldownMs: PET_SKILL_COOLDOWN_MS,
  },
  { kind: "jumpAttack", multiplier: 3 },
);
