import { coinPath } from "@/utils/paths";

import { createCoins } from "@/utils/items/createItem";

export const COINS = createCoins({
  kwanzas: {
    image: coinPath("kwanzas.svg"),
    name: "Kwanzas",
    description: "Moeda comum. Use para comprar itens e melhorias.",
    type: "none",
  },
  hypercoin: {
    image: coinPath("hypercoins.svg"),
    name: "HyperCoin",
    description: "Moeda premium rara. Use para itens especiais.",
    type: "none",
  },
} as const);
