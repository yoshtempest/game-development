import { PET_SKILL_COOLDOWN_MS } from "@/data/characters/pets/petSkills/constants";
import { def } from "@/data/characters/pets/petSkills/helpers";
import type { PetSkillDefinition } from "@/data/characters/pets/petSkills/types";

export const pet_leviathan: PetSkillDefinition = def(
  "pet_leviathan",
  "Leviathan",
  "leviathan",
  "tanker",
  {
    name: "Armadura Aquática",
    description: "Ataca com golpes d'água.",
    cooldownMs: PET_SKILL_COOLDOWN_MS,
  },
  {
    name: "Tsunami",
    description:
      "Invoca um tsunami que empurra todos os inimigos para longe e causa dano mágico em todos eles. Cada inimigo atingido tem 30% de chance de ser congelado por 3 a 7s (quanto mais vida máxima, menos tempo).",
    cooldownMs: PET_SKILL_COOLDOWN_MS,
  },
  {
    kind: "tsunami",
    multiplier: 1,
    damageType: "magical",
    pushDistance: 500,
    freezeChance: 0.3,
  },
);
