import { playerPath, npcPath } from "@/utils/paths";

import { createNpc } from "@/scenes/shared/factories";

export const pcRoomSevenNpcs = [
  createNpc(npcPath("/hungryKing/default.svg"), 9, 2),
  createNpc(npcPath("/hungryDog/default.svg"), 10, 3),
  createNpc(npcPath("/hungryDeath/right.svg"), 8, 3),
  createNpc(playerPath("/samurion/movement/up.svg"), 9, 3),
];
