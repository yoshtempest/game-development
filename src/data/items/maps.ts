import { itemPath } from "@/utils/paths";

import { createMaps } from "@/utils/items/createItem";

export const MAPS = createMaps({
  jorjao_map: {
    image: itemPath("jorjao_map.svg"),
    name: "Mapa Escolar",
    description: "Um mapa do Jorjão. Use para se localizar.",
    type: "map",
  },
} as const);
