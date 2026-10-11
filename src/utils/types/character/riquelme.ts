/**
 * Esferas do riquelme (habilidades "blue"/"red").
 *
 * A sequência de Setup (`habilities/Setup/one.svg` → `two.svg` → `three.svg`) e
 * a física da esfera são conduzidas por `useRiquelmeSpheres`; a cena só desenha
 * o frame atual. A blue é persistente e controlável (atrai inimigos); a red é
 * um arremesso que empurra quem estiver no caminho.
 */
export type RiquelmeSphereVariant = "blue" | "red";

export type RiquelmeSpherePhase =
  /** `one.svg`: surge na cabeça com blink (silhueta branca → forma normal). */
  | "spawning"
  /** `two.svg`: desliza da cabeça para o centro-direita do personagem. */
  | "moving"
  /** blue: conduzida pelo jogador (o personagem não anda). */
  | "controlled"
  /** blue: parada no lugar, ainda atraindo. */
  | "parked"
  /** blue: escala→0 + fade-out antes de sumir. */
  | "dismissing"
  /** red: arremessada em linha reta. */
  | "firing";

export type RiquelmeSphere = {
  variant: RiquelmeSphereVariant;
  phase: RiquelmeSpherePhase;
  x: number;
  y: number;
  /** Multiplicador de tamanho (0.1 no surgimento → 1). */
  scale: number;
  /** 1 = silhueta branca total (blink); 0 = forma normal. */
  blink: number;
  /** Opacidade (fade-out do dismiss). */
  opacity: number;
  direction: Direction;
};

/** Foco de câmera enquanto a blue é controlada (a câmera segue a esfera). */
export type RiquelmeSphereFocus = { x: number; y: number } | null;
