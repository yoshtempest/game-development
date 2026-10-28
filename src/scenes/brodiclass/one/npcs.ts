import { npcPath, playerPath } from "@/utils/paths";

import { createNpc } from "@/scenes/shared/factories";

export const brodiClassOneNpcs = [
  createNpc(npcPath("/marshadow/movement/up.svg"), 14, 8, 1.4),
  createNpc(npcPath("/drika/movement/down.svg"), 14, 6, 1.4),
  createNpc(playerPath("/laricell/movement/down.svg"), 15, 6, 1.4),
];
