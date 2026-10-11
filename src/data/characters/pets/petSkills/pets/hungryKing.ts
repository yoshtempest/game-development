import { PET_SKILL_COOLDOWN_MS } from "@/data/characters/pets/petSkills/constants";
import { def } from "@/data/characters/pets/petSkills/helpers";
import type { PetSkillDefinition } from "@/data/characters/pets/petSkills/types";

export const pet_hungryKing: PetSkillDefinition = def(
  "pet_hungryKing",
  "Rei dos Mortos de Fome",
  "hungryKing",
  "suporte",
  {
    name: "Reinado da Fome",
    description: "Ataca com mordidas fantasmagóricas.",
    cooldownMs: PET_SKILL_COOLDOWN_MS,
  },
  {
    name: "Invocar Morto de Fome",
    description: "Invoca um Morto de Fome para lutar ao seu lado.",
    cooldownMs: 20000,
  },
  { kind: "summon", npcType: "hungryDeath" },
);
