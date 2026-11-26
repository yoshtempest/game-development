import { npcPath } from "@/utils/paths";

import { createNpc } from "@/scenes/shared/factories";

/**
 * O Vigia Landô fica na parede ao lado da saída para a quadra (8,2), fora do
 * chão andável: quem dispara a luta é o tile da saída (`secretPassageTiles`).
 */
export const secretPassageNpcs = [
  createNpc(npcPath("/vigiaLando/default.svg"), 9, 2),
];
