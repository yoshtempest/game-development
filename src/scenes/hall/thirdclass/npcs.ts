import { npcPath } from "@/utils/paths";

import { createNpc } from "@/scenes/shared/factories";

/**
 * O Vigia Joaquim fica na parede ao lado da porta da biblioteca (9-10,2), fora
 * do chão andável: quem dispara a luta é o tile da porta (`hallThirdClassTiles`).
 */
export const thirdClassNpcs = [
  createNpc(npcPath("/vigiaJoaquim/default.svg"), 11, 2),
];
