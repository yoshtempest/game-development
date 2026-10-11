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
    name: "Muralha de Escamas",
    description: "Concede um escudo ao jogador.",
    cooldownMs: PET_SKILL_COOLDOWN_MS,
  },
  { kind: "shield", amount: 25 },
);
