/**
 * Modelo da varredura da Expansão de Domínio e dos alvos que ela desintegra.
 *
 * Tipos puros de tela: o hook que conduz a habilidade e o componente que
 * desenha o efeito compartilham a mesma forma, e `src/components/` não deve
 * importar nada de `src/hooks/`.
 */

/** Estado da varredura do mugetsuEffect pela batalha. */
export type MugetsuSweep = {
  /** Frente da varredura (px lógicos) — define o dano e o foco da câmera. */
  x: number;
  /** Ponta de partida (posição do jogador após o teleporte). */
  fromX: number;
  /** Outra ponta do mapa — a varredura termina aqui. */
  toX: number;
  direction: "left" | "right";
  /** Referência vertical (pés do jogador no instante do disparo). */
  y: number;
};

/** Fase do blink visual do teleporte: "out" (some) → "in" (vem). */
export type MugetsuBlink = "out" | "in" | null;

/** Alvo cortado pela varredura (o sprite é partido em duas metades). */
export type MugetsuDisintegrationTarget = {
  /** "main" para o NPC principal; summonId para os summons. */
  id: string;
  npcType: string;
  /** Estado do sprite no instante do toque (para resolver o sprite). */
  state: string;
  npcPhase: number;
  isAlfa: boolean;
  /** Centro do alvo (px lógicos) — a passagem da varredura usa esses eixos. */
  x: number;
  /** Pés do alvo (px lógicos). */
  y: number;
  /** Direção da varredura no toque (define o lado do corte). */
  direction: "left" | "right";
  startedAt: number;
};
