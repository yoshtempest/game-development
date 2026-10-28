/** Posição/frame visual da instância de silhueta do Ematron durante o hold. */
export type EmatronCloneVisual = {
  x: number;
  y: number;
  direction: Direction;
};

/**
 * Instância da Genki Dama do Ematron durante o preparing/hold e o voo até o
 * inimigo. Na fase `preparing` ela paira acima do jogador; na fase `flying`
 * percorre o caminho até o alvo antes de explodir em área.
 */
export type GenkiDamaVisual = {
  /** Multiplicador de tamanho (cresce 1.2x por segundo no preparing). */
  scale: number;
  phase: "preparing" | "flying";
  /** Posição atual do projétil (crafted pelo hook a cada tick). */
  x: number;
  y: number;
};
