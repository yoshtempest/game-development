/**
 * Tipos do ataque básico do lucaua: o golpe é um projétil de energia
 * (`energyAttack.svg`) disparado da mão — uma mão por vez (alternando entre
 * `leftHandAttack`/`rightHandAttack`) ou as duas (`bothSidesAttack`) quando há
 * inimigos dos dois lados do player.
 */

/** Variante do básico do lucaua: pose da mão do sprite de ataque. */
export type LucauaAttackVariant = "left" | "right" | "both";

/** Lado do shield de bloqueio do lucaua: espelha o lado de quem ataca. */
export type LucauaShieldSide = "left" | "right";

/**
 * Shield de bloqueio por lado. O valor é um nonce: `0` = inativo, `> 0` = ativo.
 * Cada golpe bloqueado incrementa o nonce do lado para remontar o sprite e
 * reexecutar a animação de surgimento (o "blink").
 */
export type LucauaShieldSides = Record<LucauaShieldSide, number>;

/** Alvo do projétil de energia (NPC principal ou summon inimigo vivo). */
export type LucauaTarget = {
  id: string;
  x: number;
  y: number;
};

/** Projétil de energia do ataque básico do lucaua em voo. */
export type LucauaEnergyProjectile = {
  id: string;
  x: number;
  y: number;
  /** Direção do voo: 1 = direita, -1 = esquerda (o sprite espelha nesse caso). */
  dirX: 1 | -1;
};

/**
 * "Energia Dimensional" — portais do lucaua.
 *
 * Dois portais formam um par: a entidade que entra num sai no outro (player,
 * NPC, summons, aliados e pet). A energia (25% do máximo) é paga ao posicionar
 * e devolvida ao desfazer; com dois no mapa o toque no botão vira o undo.
 */

/** Forma do portal: deitado no chão, em pé (frontal) ou suspenso (aéreo). */
export type LucauaPortalKind = "ground" | "default" | "air";

/** Fase do portal: voando da mão até o destino, ou já fixo no mapa. */
export type LucauaPortalPhase = "flying" | "placed";

/**
 * Warp de projétil entre os portais. Recebe a posição do projétil e devolve o
 * destino (o portal par) quando ele cruza a zona de travessia — ou `null`
 * quando não há travessia (menos de dois portais, já desarmado, fora da zona).
 * Injetado nos loops de projétil (NPC e energia do lucaua) pelo hook de portais.
 */
export type LucauaPortalWarpFn = (
  id: string,
  x: number,
  y: number,
) => { x: number; y: number } | null;

/**
 * Portal posicionado (ou em voo). O `y` é a **âncora** (o chão em que a
 * entidade entra), não o centro da arte: o render sobe o sprite a partir dele,
 * e o teleporte/hitbox usam a mesma coordenada.
 */
export type LucauaPortal = {
  id: string;
  kind: LucauaPortalKind;
  phase: LucauaPortalPhase;
  /** Posição atual — interpolada enquanto o portal voa até o destino. */
  x: number;
  y: number;
  /** Origem (mão do lucaua) e destino do voo, para a interpolação. */
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  /** Timestamp em que o voo começou. */
  startTime: number;
  /** Energia paga por este portal — devolvida inteira ao desfazê-lo. */
  cost: number;
};

/** Fantasma do portal durante o posicionamento pelo joystick. */
export type LucauaPortalGhost = {
  kind: LucauaPortalKind;
  x: number;
  y: number;
};

/** Foco de câmera enquanto um portal voa até o destino (`null` = sem foco). */
export type LucauaPortalFocus = { x: number; y: number } | null;
