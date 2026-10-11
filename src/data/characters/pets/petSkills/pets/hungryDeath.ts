import { PET_SKILL_COOLDOWN_MS } from "@/data/characters/pets/petSkills/constants";
import { def } from "@/data/characters/pets/petSkills/helpers";
import type { PetSkillDefinition } from "@/data/characters/pets/petSkills/types";

export const pet_hungryDeath: PetSkillDefinition = def(
  "pet_hungryDeath",
  "Morto de Fome",
  "hungryDeath",
  "dano",
  {
    name: "Fome Eterna",
    description: "Ataca sem nunca se saciar.",
    cooldownMs: PET_SKILL_COOLDOWN_MS,
  },
  {
    name: "Devora Tudo",
    description:
      "Teleporta na frente do inimigo com maior vida, morde e o faz sangrar por 5s.",
    cooldownMs: PET_SKILL_COOLDOWN_MS,
  },
  {
    kind: "teleportBite",
    multiplier: 3,
    bleedMs: 5000,
  },
);
