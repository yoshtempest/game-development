import { PET_SKILL_COOLDOWN_MS } from "@/data/characters/pets/petSkills/constants";
import { def } from "@/data/characters/pets/petSkills/helpers";
import type { PetSkillDefinition } from "@/data/characters/pets/petSkills/types";

export const pet_madame: PetSkillDefinition = def(
  "pet_madame",
  "Dona Aranha",
  "madame",
  "suporte",
  {
    name: "Teia Envenenada",
    description: "Ataca com fios de teia.",
    cooldownMs: PET_SKILL_COOLDOWN_MS,
  },
  {
    name: "Teia Regeneradora",
    description: "Recupera a vida do jogador.",
    cooldownMs: PET_SKILL_COOLDOWN_MS,
  },
  { kind: "heal", amount: 25 },
);
