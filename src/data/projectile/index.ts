import { FOUR_HUNDRED_MS } from "@/data/ms";

export const ProjectileConstants = {
  SPEED: 17,
  SPEAR_FALL_SPEED: 18,
  OFFSCREEN_MARGIN: 200,
  MAP_WIDTH: 1000,
  MAP_HEIGHT: 600,
  OFFSCREEN_BOTTOM: 800,
  /** Velocidade do projétil terrestre (burst do hungryKing na fase 2). */
  GROUND_SPEED: 17,
  /** Alcance horizontal do projétil terrestre para acertar o jogador. */
  GROUND_HIT_RANGE_X: 60,
  /** Alcance vertical do projétil terrestre (a linha de voo é o chão). */
  GROUND_HIT_RANGE_Y: 140,
  /**
   * Tempo que o projétil terrestre fica no sprite de estrago antes de sumir.
   * Só vale quando `detonatesOnHit` está ligado.
   */
  GROUND_IMPACT_MS: FOUR_HUNDRED_MS,
  /** Largura do sprite do projétil terrestre (âncora centralizada). */
  GROUND_SPRITE_WIDTH: 250,
};

/** Parâmetros de destruição de projéteis (HP, corte e colisões). */
export const ProjectileHpConstants = {
  /** HP padrão de projéteis comuns/pull/ground/rain (inteiro). */
  DEFAULT_HP: 6,
  /** HP dos fragmentos cortados pelo Marshadow. */
  CUT_FRAGMENT_HP: 2,
  /**
   * Dano de fallback quando não há golpe do jogador resolvido (ex: treino, antes
   * do `usePlayer` montar). Em batalha o dano aplicado é o do golpe ativo, pelo
   * pipeline de `playerHit`/`specialHit`.
   */
  PLAYER_MELEE_DAMAGE: 4,
  /** Alcance horizontal da esfera do Natsuki em voo para destruir projéteis. */
  SPHERE_HIT_RANGE_X: 60,
  /** Alcance vertical da esfera do Natsuki em voo para destruir projéteis. */
  SPHERE_HIT_RANGE_Y: 140,
  /** Alcance de destruição da chuva de lanças (DX ao espinho mais próximo). */
  RAIN_DESTROY_RANGE_X: 110,
  /** Faixa vertical em torno do jogador em que o espinho fica ao alcance. */
  RAIN_DESTROY_VERTICAL_RANGE: 150,
  /** Distância em que o NPC "engole" fragmentos cortados que voltam a ele. */
  CUT_FRAGMENT_DESTROY_RADIUS: 60,
};

export const PlayerSpecialConstants = {
  SPHERE_OFFSET_X: 30,
  FIRE_DURATION: FOUR_HUNDRED_MS,
  FIRE_DISTANCE: 700,
  MERGE_TIME_SCALE: 0.7,
  MOVE_TIME_SCALE: 0.9,
};
