/**
 * Modelo de tela da habilidade "I Am Atomic" do marshadow: a explosão, o
 * cut-in sobre cada inimigo atingido e a carga que o combate consome.
 *
 * Tipos puros: o hook que dispara a habilidade, o que aplica o dano e o
 * componente que desenha compartilham a mesma forma, e `src/components/` não
 * deve importar nada de `src/hooks/`.
 */

/** Explosão da explosão atômica centrada no alvo (inimigo de maior vida máxima). */
export type AtomicExplosion = {
  x: number;
  y: number;
  npcType: string;
  phase: "starting" | "explosion";
};

/** CutInEnemie sobre um inimigo atingido dentro do raio. */
export type AtomicCut = {
  /** Contador de ativações — vira a chave React para reiniciar o sprite. */
  key: number;
  x: number;
  y: number;
  npcType: string;
  /** Ângulo aleatório (0 a 90 graus) do strike sobre o inimigo. */
  rotation: number;
};

/** Inimigos atingidos pelo dano (aplicado no useBattleCombat). */
export type AtomicBoomPayload = {
  /** id do alvo ("main" ou summon): recebe dano em dobro. */
  targetId: string;
  targetX: number;
  targetY: number;
  /** NPC principal atingido (sofre dano + CutInEnemie com chance de sangrar). */
  hitMain: boolean;
  hitSummonIds: string[];
};
