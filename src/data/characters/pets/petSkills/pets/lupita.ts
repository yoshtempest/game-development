import { PET_SKILL_COOLDOWN_MS } from "@/data/characters/pets/petSkills/constants";
import { def } from "@/data/characters/pets/petSkills/helpers";
import type { PetSkillDefinition } from "@/data/characters/pets/petSkills/types";

export const pet_lupita: PetSkillDefinition = def(
  "pet_lupita",
  "Lupita",
  "lupita",
  "dano",
  {
    name: "Mordida Forte",
    description: "Ataca com uma mordida poderosa.",
    cooldownMs: PET_SKILL_COOLDOWN_MS,
  },
  {
    name: "Mordida Fatal",
    description: "Causa dano triplo ao inimigo.",
    cooldownMs: PET_SKILL_COOLDOWN_MS,
  },
  { kind: "damage", multiplier: 3 },
);
