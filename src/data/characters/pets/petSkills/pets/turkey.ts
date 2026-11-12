import { PET_SKILL_COOLDOWN_MS } from "@/data/characters/pets/petSkills/constants";
import { def } from "@/data/characters/pets/petSkills/helpers";
import type { PetSkillDefinition } from "@/data/characters/pets/petSkills/types";

export const pet_turkey: PetSkillDefinition = def(
  "pet_turkey",
  "Peru",
  "turkey",
  "suporte",
  {
    name: "Andarilho",
    description: "Corre mais rápido no modo exploração.",
    cooldownMs: PET_SKILL_COOLDOWN_MS,
  },
  {
    name: "Tornado de Terra",
    description:
      "Bate as asas criando um tornado de terra: os inimigos atingidos têm 30% a menos de chance de acertar o jogador por 4s.",
    cooldownMs: PET_SKILL_COOLDOWN_MS,
  },
  { kind: "blindTornado", missChance: 0.3, durationMs: 4000 },
);
