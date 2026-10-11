import {
  FIVE_HUNDRED_MS,
  ONE_HUNDRED_TWENTY_MS,
  TWO_HUNDRED_TWENTY_MS,
} from "@/data/ms";

/**
 * Constantes do ataque básico do lucaua: projétil de energia (`energyAttack.svg`)
 * disparado da mão a cada golpe — uma mão por vez (alternando entre ataques),
 * ou as duas quando há inimigos nos dois lados do player.
 */
export const LucauaEnergyConstants = {
  /** Velocidade horizontal do projétil (px lógicos por tick de 20ms). */
  SPEED_PER_TICK: 20,
  /** Distância horizontal do spawn em relação ao centro do player. */
  SPAWN_OFFSET_X: 52,
  /** Altura do spawn: fração da altura do sprite renderizado (nível da mão). */
  HAND_HEIGHT_RATIO: 0.55,
  /** Raio horizontal da colisão com o alvo (espelha a geometria do melee). */
  HIT_RANGE_X: 60,
  /** Tolerância vertical da colisão e da detecção de lado (espelha o melee). */
  VERTICAL_TOLERANCE: 150,
  /** Margem além do mapa para destruir o projétil que saiu da arena. */
  OFFSCREEN_MARGIN: 40,
  /** Largura do sprite renderizado (a altura segue o aspect do arquivo). */
  SPRITE_WIDTH: 100,
} as const;

/**
 * Shield de bloqueio do lucaua (`inFight/shield.svg`): substitui o sprite de
 * bloqueio do personagem. Surge no lado de quem ataca, pisca em silhueta branca
 * e some sozinho quando o personagem fica um tempo sem ser atacado.
 */
export const LucauaShieldConstants = {
  /** Tempo sem ser atacado antes de começar o fade-out, em ms. */
  HOLD_MS: FIVE_HUNDRED_MS,
  /** Duração do fade-out, em ms. */
  FADE_MS: TWO_HUNDRED_TWENTY_MS,
  /** Duração do "blink" de surgimento (silhueta branca → imagem normal), em ms. */
  BLINK_MS: ONE_HUNDRED_TWENTY_MS,
} as const;