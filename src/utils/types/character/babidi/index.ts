import type { BabidiAttackProjectileSprite } from "./attack";

/** Lado do shield de bloqueio do babidi: espelha o lado de quem ataca. */
export type BabidiShieldSide = "left" | "right";

/**
 * Shield de bloqueio por lado. O valor é um nonce: `0` = inativo, `> 0` = ativo.
 * Cada golpe bloqueado incrementa o nonce do lado para remontar o sprite e
 * reexecutar a animação de surgimento (o "blink").
 */
export type BabidiShieldSides = Record<BabidiShieldSide, number>;

/** Alvo do projétil de energia (NPC principal ou summon inimigo vivo). */
export type BabidiTarget = {
  id: string;
  x: number;
  y: number;
};

/** Projétil de energia do ataque básico do babidi em voo. */
export type BabidiEnergyProjectile = {
  id: string;
  x: number;
  y: number;
  /** Sprite do disparo: alterna entre `yellowDog` e `blueDog` a cada golpe. */
  sprite: BabidiAttackProjectileSprite;
  /** Componente horizontal do voo; o sprite espelha quando é negativo. */
  dirX: number;
  /** Componente vertical do voo (0 no disparo reto). */
  dirY: number;
};

/** Projétil missile do ataque básico do babidi no modo withMissile. */
export type BabidiMissileProjectile = {
  id: string;
  x: number;
  y: number;
  /** Posição de surgimento do portal (fixa). */
  spawnX: number;
  spawnY: number;
  /** Fase: portal de surgimento, voo teleguiado, ou explosão. */
  phase: "portal" | "flying" | "exploding";
  /** Ângulo (graus) da direção de voo atual, para rotação da imagem. */
  angle: number;
  /** Ponto da imagem do alvo a atingir: pés, centro ou topo (aleatório). */
  aim: "feet" | "center" | "top";
  /** Tempo (ms) decorrido desde o spawn (para a animação do portal). */
  age: number;
  /** Tempo (ms) restante na fase de explosão. */
  explosionRemaining: number;
  /** Alvo atual (id do NPC principal ou summon). */
  targetId: string | null;
  /** Direção horizontal atual do voo: +1 direita (padrão), -1 esquerda (flip). */
  dirX: number;
  /** Se true, não renderiza o portal de surgimento (Machine Gama). */
  noPortal?: boolean;
};

/** Clone gerado pela passiva de explosão do babidi. */
export type BabidiCloneVisual = {
  id: string;
  x: number;
  y: number;
  state: "idle" | "run";
  exploded: boolean;
  flipped?: boolean;
};

/** Portal/bomba/explosão da Energia Dimensional do babidi. */
export type BabidiBombDropVisual = {
  id: string;
  phase: "portal" | "falling" | "exploding";
  /** Ponto no chão do inimigo principal (onde a bomba explode). */
  targetX: number;
  targetY: number;
  /** Linha do portal aéreo, acima do alvo. */
  portalY: number;
};
