import { keyPath } from "@/utils/paths";

import { createKeys } from "@/utils/items/createItem";

export const KEYS = createKeys({
  director_key: {
    image: keyPath("director.svg"),
    name: "Chave enferrujada",
    description:
      "Uma chave velha e enferrujada. Deve abrir alguma porta por aí.",
    type: "key",
  },
  common_key: {
    image: keyPath("common.svg"),
    name: "Chave Simples",
    description: "Uma chave simples. Abre baús comuns.",
    type: "key",
  },
  rare_key: {
    image: keyPath("rare.svg"),
    name: "Chave Rara",
    description: "Uma chave reluzente. Abre baús raros.",
    type: "key",
  },
  epic_key: {
    image: keyPath("epic.svg"),
    name: "Chave Épica",
    description: "Uma chave energizada. Abre baús épicos.",
    type: "key",
  },
  boss_key: {
    image: keyPath("boss.svg"),
    name: "Chave de Chefão",
    description: "Uma chave temível. Abre baús de chefão.",
    type: "key",
  },
  legendary_key: {
    image: keyPath("legendary.svg"),
    name: "Chave Lendária",
    description: "Uma chave mística. Abre baús lendários.",
    type: "key",
  },
} as const);
