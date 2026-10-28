/** Overlay do cut-in de golpe do marshadow desenhado sobre o NPC atingido. */
export type CutInEnemieOverlay = {
  /** Contador de ativações — vira a chave React para reiniciar o sprite. */
  key: number;
  /** Ângulo aleatório (0 a 90 graus) do strike sobre o NPC. */
  rotation: number;
};
