import { itemPath } from "@/utils/paths";

import { createFoods } from "@/utils/items/createItem";

export const FOODS = createFoods({
  queijo_cabra: {
    image: itemPath("goat_cheese.svg"),
    name: "Queijo de Cabra",
    description:
      "Queijo curado de cabra. Nutritivo e saboroso. Recupera 30 de fome.",
    type: "food",
  },
  porcao_arroz: {
    image: itemPath("rice.svg"),
    name: "Porção de Arroz",
    description: "Arroz fresquinho. Enche a barriga. Recupera 20 de fome.",
    type: "food",
  },
  ovo_piupiu: {
    image: itemPath("piupiu_egg.svg"),
    name: "Ovo de Piupiu",
    description:
      "Ovo misterioso de Piupiu. Frito ou cozido? Recupera 25 de fome.",
    type: "food",
  },
  goat_meat: {
    image: itemPath("goat_meat.svg"),
    name: "Carne de bode",
    description: "Denovo isso? Todo dia isso mano.",
    type: "food",
  },
} as const);
