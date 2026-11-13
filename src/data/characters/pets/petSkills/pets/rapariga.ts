import { PET_SKILL_COOLDOWN_MS } from "@/data/characters/pets/petSkills/constants";
import { def } from "@/data/characters/pets/petSkills/helpers";
import type { PetSkillDefinition } from "@/data/characters/pets/petSkills/types";

export const pet_rapariga: PetSkillDefinition = def(
  "pet_rapariga",
  "Rapariga",
  "rapariga",
  "suporte",
  {
    name: "Ronronar",
    description: "Ataca com arranhões rápidos.",
    cooldownMs: PET_SKILL_COOLDOWN_MS,
  },
  {
    name: "Chamado dos Gatos",
    description:
      "Invoca um gato aleatório (Schrödinger, de Botas, Garfield, Tom, Meowth, Hello Kitty, Nyan Cat, Maneki-Neko ou Gato de Bruxo), cada um com um efeito próprio.",
    cooldownMs: PET_SKILL_COOLDOWN_MS,
  },
  { kind: "summonCat" },
);
