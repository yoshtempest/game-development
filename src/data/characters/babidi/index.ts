import {
  EIGHT_HUNDRED_MS,
  FIVE_HUNDRED_MS,
  FOUR_HUNDRED_MS,
  ONE_HUNDRED_TWENTY_MS,
  SIXTEEN_MS,
  TWO_HUNDRED_TWENTY_MS,
} from "@/data/ms";
import type { BabidiPortalKind } from "@/utils/types/character/babidi";

/**
 * Constantes do ataque básico do babidi: projétil de energia (`energyAttack.svg`)
 * disparado da mão a cada golpe — uma mão por vez (alternando entre ataques),
 * ou as duas quando há inimigos nos dois lados do player.
 */
export const BabidiEnergyConstants = {
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
 * Shield de bloqueio do babidi (`inFight/shield.svg`): substitui o sprite de
 * bloqueio do personagem. Surge no lado de quem ataca, pisca em silhueta branca
 * e some sozinho quando o personagem fica um tempo sem ser atacado.
 */
export const BabidiShieldConstants = {
  /** Tempo sem ser atacado antes de começar o fade-out, em ms. */
  HOLD_MS: FIVE_HUNDRED_MS,
  /** Duração do fade-out, em ms. */
  FADE_MS: TWO_HUNDRED_TWENTY_MS,
  /** Duração do "blink" de surgimento (silhueta branca → imagem normal), em ms. */
  BLINK_MS: ONE_HUNDRED_TWENTY_MS,
} as const;

/**
 * Habilidade "Energia Dimensional" (portais do babidi).
 *
 * O custo é uma fração da energia MÁXIMA (não do valor atual), então o teto de
 * portais é o que limita o uso — e o toque no botão com o par completo vira o
 * undo do último (devolvendo exatamente o que foi pago).
 */
export const BabidiPortalConstants = {
  /** Fração da energia máxima consumida por portal (25%). */
  COST_RATIO: 0.25,
  /** Máximo de portais no mapa; acima disso o toque desfaz o último. */
  MAX_PORTALS: 2,
  /** Altura do portal aéreo acima do chão (o player precisa pular para entrar). */
  AIR_HEIGHT: 400,
  /**
   * Passo do fantasma por tick do joystick (px lógicos). O tick é de 16ms, então
   * 5px ≈ 312px/s — o mesmo ritmo do passo de caminhada do player
   * (`BATTLE_STEP` 10px a cada 30ms), o que dá precisão para mirar o portal.
   */
  MOVE_PX: 5,
  /** Intervalo do tick de posicionamento/voo/teleporte. */
  TICK_MS: SIXTEEN_MS,
  /** Duração do voo da mão até o destino (com a câmera seguindo o portal). */
  FLIGHT_MS: FOUR_HUNDRED_MS,
  /** Largura renderizada do portal (a altura segue o aspect da arte). */
  SPRITE_WIDTH: 130,
  /** Meia-largura da zona de travessia. */
  TRIGGER_HALF_X: 55,
  /**
   * Meia-altura da zona de travessia, medida a partir dos **pés** da entidade.
   * Alto o bastante para o ápice do pulo duplo (~256px) alcançar o portal
   * aéreo (400px acima do chão) e baixo o suficiente para o pulo simples
   * (~136px) não alcançar.
   */
  TRIGGER_HALF_Y: 160,
  /**
   * Margem **acima** da linha do portal terrestre em que os pés ainda contam
   * como "dentro". O portal deitado abre um buraco no chão: quem anda (pés na
   * linha) ou cai entra, mas pular por cima escapa — o ápice do pulo simples
   * passa de 128px, então uma margem pequena basta para dar essa saída.
   */
  GROUND_ENTER_MARGIN: 24,
  /** Beat mínimo do sprite de queda depois de atravessar um portal aéreo. */
  LANDING_MS: FOUR_HUNDRED_MS,
  /**
   * Quanto abaixo do portal terrestre a entidade afunda antes de atravessar
   * (px lógicos). O portal deitado "abre um buraco": primeiro a entidade cai
   * esses 200px, só então sai no outro portal.
   */
  GROUND_FALL_DEPTH: 200,
  /** Aceleração da queda simulada (px/tick²), igual à gravidade do player. */
  FALL_GRAVITY: 1,
  /**
   * Teto de tempo da queda: se a física não chegar ao alvo (ex.: o chão
   * intercepta o trajeto), a travessia dispara sozinha para não prender a
   * entidade na zona do portal.
   */
  FALL_MAX_MS: EIGHT_HUNDRED_MS,
} as const;

/** Ordem dos tipos no seletor de portal (o índice inicial é o `default`). */
export const BABIDI_PORTAL_KINDS: readonly BabidiPortalKind[] = [
  "ground",
  "default",
  "air",
];
