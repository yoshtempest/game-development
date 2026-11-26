import { npcPath } from "@/utils/paths";

import { createNpc } from "@/scenes/shared/factories";

/**
 * O Vigia João fica na parede ao lado da porta da Sala dos Professores (15,8)
 * e não num tile de chão: assim ele não bloqueia o caminho do mapa e a luta é
 * disparada pela própria porta (`jailsonOneTiles`).
 */
export const jailsonOneNpcs = [
  createNpc(npcPath("/jailson/default.svg"), 9, 1),
  createNpc(npcPath("/vigiaJoao/default.svg"), 16, 8),
];
