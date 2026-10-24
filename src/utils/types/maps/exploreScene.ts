import type { DialogueSystem } from "@/utils/types/sceneHooks";

export type NpcSizeResolver = (src: string) => number | undefined;

export type SceneNPCData = {
  src: string | NpcSrcResolver;
  gridX: number;
  gridY: number;
  size?: number | NpcSizeResolver;
  interaction?: (dialogueSystem: DialogueSystem) => void;
  /**
   * Classe extra do sprite. Efeitos de cena que precisam de CSS próprio (o
   * teleport do Sistema, por exemplo) entram por aqui em vez de remountar o
   * `<img>` — o `src` pode mudar de fase sem perder a animação.
   */
  className?: string;
  /**
   * Some do mapa sem desmontar: preserva posição e z-index, então um efeito
   * pode terminar de rodar com o sprite já invisível.
   */
  hidden?: boolean;
  /**
   * Identidade estável do NPC, usada como `key` quando presente. Um NPC que
   * anda muda de tile a cada passo, e uma `key` derivada da posição remontaria
   * a imagem a cada passo — o que zera a transição de `moveMs` e faz o NPC
   * piscar no lugar em vez de deslizar.
   */
  id?: string;
  /**
   * Duração em ms do deslize entre tiles. Sem ela a posição troca de uma vez,
   * que é o comportamento de todo NPC parado.
   */
  flipX?: boolean;
  moveMs?: number;
};

export type ItemPickupTile = {
  x: number;
  y: number;
  visible: boolean;
  height?: number;
  image?: string;
  size?: number;
};
