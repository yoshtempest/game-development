import { playerPath } from "@/utils/paths";

import { createNpc } from "@/scenes/shared/factories";

export const cantinaTwoNpcs = [
  createNpc(playerPath("/samurion/movement/right.svg"), 6, 6),
  createNpc(playerPath("/marshadow/movement/up.svg"), 8, 8),
  createNpc(playerPath("/ematron/default.svg"), 14, 4),
  createNpc(playerPath("/srGuaxinim/movement/down.svg"), 7, 4),
  createNpc(playerPath("/laricell/movement/up.svg"), 15, 10),
  createNpc(playerPath("/drika/movement/up.svg"), 14, 10),
  createNpc(playerPath("/yra/default.svg"), 13, 9),
  createNpc(playerPath("/camyKaze/default.svg"), 14, 8),
];
