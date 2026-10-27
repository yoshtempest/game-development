import { itemPath } from "@/utils/paths";

import { createMaps } from "@/utils/items/createItem";

export const TELEPORTS = createMaps({
  good_powder: {
    image: itemPath("good_powder.svg"),
    name: "Pó do bom",
    description: "Um pó brilhante e cheiroso. Dizem que causa alucinações.",
    type: "teleport",
  },
} as const);
