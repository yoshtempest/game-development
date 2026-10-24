import { itemPath } from "@/utils/paths";

import { createItems } from "@/utils/items/createItem";

export const COMMON = createItems({
  aura_letter: {
    image: itemPath("aura_letter.svg"),
    name: "Carta de muita aura",
    description:
      "Uma carta com uma aura misteriosa. Melhor não ler em voz alta.",
    type: "none",
  },
  package_01: {
    image: itemPath("package_01.svg"),
    name: "Embalagem com surpresinha",
    description: "Um pacote suspeito. Quem sabe o que tem dentro?",
    type: "none",
  },
  desired_gear: {
    image: itemPath("desired_gear.svg"),
    name: "Peça desejada",
    description: "Era essa a peça que o Jailson queria?",
    type: "none",
  },
  orange_juice: {
    image: itemPath("orange_juice.svg"),
    name: "Suco de laranja",
    description:
      "Suco natural, geladinho. Refrescante. Perfeito para relaxar...",
    type: "none",
  },
  sausage: {
    image: itemPath("sausage.svg"),
    name: "Linguição Grosso",
    description: "Uma linguiça enorme e suculenta. Dá até água na boca.",
    type: "none",
  },
  foodPlate: {
    image: itemPath("foodPlate.svg"),
    name: "Prato de comida",
    description: "Um prato com arroz e bode, tudo que precisa.",
    type: "none",
  },
  spoiledFoodPlate: {
    image: itemPath("spoiledFoodPlate.svg"),
    name: "Prato de comida estragada",
    description: "A comida aparenta estar estragada, que pena em.",
    type: "none",
  },
  suspect_milk: {
    image: itemPath("suspect_milk.svg"),
    name: "Leite Bovino",
    description: "Um leite suspeito. Venceu mês passado.",
    type: "none",
  },
  skool: {
    image: itemPath("skool.svg"),
    name: "Latinha de Cerveja",
    description: "Uma Skool gelada. Não é a melhor, mas quebra o galho.",
    type: "none",
  },
} as const);
