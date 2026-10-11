import { PET_SKILL_COOLDOWN_MS } from "@/data/characters/pets/petSkills/constants";
import { def } from "@/data/characters/pets/petSkills/helpers";
import type { PetSkillDefinition } from "@/data/characters/pets/petSkills/types";

export const pet_duque: PetSkillDefinition = def(
  "pet_duque",
  "Duque",
  "duque",
  "dano",
  {
    name: "Olhar Julgador",
    description: "Ataca com olhar penetrante.",
    cooldownMs: PET_SKILL_COOLDOWN_MS,
  },
  {
    name: "Latido Perfurante",
    description: "Causa dano triplo ao inimigo.",
    cooldownMs: PET_SKILL_COOLDOWN_MS,
  },
  { kind: "damage", multiplier: 3 },
);
