import { manaPotionPath, xpPotionPath } from "@/utils/paths";

import { createPotions } from "@/utils/items/createItem";

export const POTIONS = createPotions({
  xp_potion_common: {
    image: xpPotionPath("common.svg"),
    name: "Danonão Comum",
    description: "Multiplica o XP ganho em 1.5x por 5 minutos.",
    type: "consumable",
  },
  xp_potion_rare: {
    image: xpPotionPath("rare.svg"),
    name: "Danonão Raro",
    description: "Multiplica o XP ganho em 1.75x por 10 minutos.",
    type: "consumable",
  },
  xp_potion_epic: {
    image: xpPotionPath("epic.svg"),
    name: "Danonão Normal",
    description: "Multiplica o XP ganho em 2x por 15 minutos.",
    type: "consumable",
  },
  xp_potion_boss: {
    image: xpPotionPath("boss.svg"),
    name: "Danonão Forte",
    description: "Multiplica o XP ganho em 2.5x por 20 minutos.",
    type: "consumable",
  },
  xp_potion_legendary: {
    image: xpPotionPath("legendary.svg"),
    name: "Danonão Grosso",
    description: "Multiplica o XP ganho em 3x por 30 minutos.",
    type: "consumable",
  },
  mana_potion_small: {
    image: manaPotionPath("small.svg"),
    name: "Poção de Mana",
    description: "Poção azul restauradora. Recupera 50 de mana em batalha.",
    type: "consumable",
  },
  mana_potion_great: {
    image: manaPotionPath("great.svg"),
    name: "Poção de Mana Grande",
    description: "Poção de mana reforçada. Recupera 100 de mana em batalha.",
    type: "consumable",
  },
} as const);
