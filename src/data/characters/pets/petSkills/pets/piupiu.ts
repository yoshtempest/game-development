import { def } from "@/data/characters/pets/petSkills/helpers";
import type { PetSkillDefinition } from "@/data/characters/pets/petSkills/types";

export const pet_piupiu: PetSkillDefinition = def(
  "pet_piupiu",
  "Piupiu",
  "piupiu",
  "suporte",
  {
    name: "Escudo Piu",
    description: "Coloca um escudo a cada 10s que bloqueia 1 ataque.",
    cooldownMs: 10000,
  },
  {
    name: "Cura de Piu",
    description: "Cura o jogador com porcentagem da vida máxima.",
    cooldownMs: 8000,
  },
  { kind: "healPercent", perStar: [10, 25, 45, 70, 100] },
  { kind: "oneHitShield", cooldownMs: 10000 },
);
