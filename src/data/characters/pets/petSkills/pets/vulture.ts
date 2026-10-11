import { PET_SKILL_COOLDOWN_MS } from "@/data/characters/pets/petSkills/constants";
import { def } from "@/data/characters/pets/petSkills/helpers";
import type { PetSkillDefinition } from "@/data/characters/pets/petSkills/types";

export const pet_vulture: PetSkillDefinition = def(
  "pet_vulture",
  "Zeca Urubu",
  "zecaUrubu",
  "dano",
  {
    name: "Voo de Bicada",
    description: "Ataca com bicadas em voo.",
    cooldownMs: PET_SKILL_COOLDOWN_MS,
  },
  {
    name: "Mergulho Abutre",
    description: "Causa dano triplo ao inimigo.",
    cooldownMs: PET_SKILL_COOLDOWN_MS,
  },
  { kind: "damage", multiplier: 3 },
);
