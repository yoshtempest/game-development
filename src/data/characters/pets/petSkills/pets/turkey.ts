import { PET_SKILL_COOLDOWN_MS } from "@/data/characters/pets/petSkills/constants";
import { def } from "@/data/characters/pets/petSkills/helpers";
import type { PetSkillDefinition } from "@/data/characters/pets/petSkills/types";

export const pet_turkey: PetSkillDefinition = def(
  "pet_turkey",
  "Peru",
  "turkey",
  "montaria",
  {
    name: "Andarilho",
    description: "Corre mais rápido no modo exploração.",
    cooldownMs: PET_SKILL_COOLDOWN_MS,
  },
  {
    name: "Voo Rasante",
    description: "Montaria não luta em batalha.",
    cooldownMs: PET_SKILL_COOLDOWN_MS,
  },
  { kind: "damage", multiplier: 1 },
);
