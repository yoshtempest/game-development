import {
  FIVE_HUNDRED_MS,
  ONE_HUNDRED_TWENTY_MS,
  ONE_HUNDRED_MS,
  TEN_THOUSAND_MS,
  THREE_HUNDRED_MS,
  THREE_THOUSAND_MS,
  TWO_HUNDRED_MS,
  TWO_HUNDRED_TWENTY_MS,
} from "@/data/ms";

/**
 * Constantes do ataque básico do babidi: projétil de energia (sprite alterna
 * entre `yellowDog` e `blueDog`) disparado da mão a cada golpe — uma mão por
 * vez (alternando entre ataques), ou as duas quando há inimigos nos dois lados
 * do player.
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

/** Rede de pesca do babidi: root curto, inquebrável e com custo/cooldown. */
export const BabidiFishingNetConstants = {
  /** Fração da energia MÁXIMA consumida ao lançar a rede (10%). */
  COST_RATIO: 0.1,
  /** Recarga base entre lançamentos (10s, antes do CDR). */
  COOLDOWN_MS: TEN_THOUSAND_MS,
  /** Tempo que o inimigo principal fica imobilizado. */
  ROOT_MS: THREE_THOUSAND_MS,
} as const;

/** Expansão de Domínio do babidi (Machine Gama). */
export const BabidiDomainConstants = {
  /** Vida do Machine Gama como múltiplo da vida máxima do jogador. */
  MACHINE_GAMA_HP_MULTIPLIER: 10,
} as const;

/**
 * "Energia Dimensional" simples: o portal aéreo abre acima do inimigo principal
 * e a bomba cai de lá. Sem par de portais e sem teletransporte.
 */
export const BabidiBombDropConstants = {
  /** Fração da energia MÁXIMA consumida (10%). */
  COST_RATIO: 0.1,
  /** Recarga base entre usos (10s, antes do CDR). */
  COOLDOWN_MS: TEN_THOUSAND_MS,
  /** Tempo do sprite `upAttack` antes de o portal abrir. */
  WINDUP_MS: THREE_HUNDRED_MS,
  /** Tempo do portal aberto antes de a bomba começar a cair. */
  PORTAL_MS: TWO_HUNDRED_MS,
  /** Duração da queda da bomba até o alvo. */
  FALL_MS: FIVE_HUNDRED_MS,
  /** Duração da explosão no alvo. */
  EXPLOSION_MS: TWO_HUNDRED_MS,
  /** Altura lógica do portal acima dos pés do inimigo principal. */
  PORTAL_HEIGHT: 200,
  /** Passo do tick da queda/explosão. */
  TICK_MS: ONE_HUNDRED_MS,
  /** Largura renderizada da bomba. */
  BOMB_SIZE: 70,
  /** Largura renderizada do portal aéreo. */
  PORTAL_SIZE: 90,
  /** Largura renderizada da explosão. */
  EXPLOSION_SIZE: 64,
} as const;
