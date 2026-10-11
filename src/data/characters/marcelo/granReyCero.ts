import {
  FOUR_HUNDRED_FIFTY_MS,
  TWO_HUNDRED_MS,
  TWO_THOUSAND_MS,
} from "@/data/ms";

/**
 * Tuning do "Gran Rey Cero" do marcelo.
 *
 * A lâmina nasce no personagem e percorre 500px na direção em que ele mira.
 * O percurso tem orçamento de 2s: sem alvo, é tempo fixo de deslocamento. Ao
 * encostar em um inimigo a lâmina trava o deslocamento (o "corte" para de
 * avançar rápido) e passa a rastejar devagar, causando dano a cada 200ms até
 * completar 10 instâncias. Ao sair do alcance sem ter fechado as 10, a
 * contagem de 2s volta a correr e a lâmina retoma o caminho até o fim.
 */

// ── Ciclo principal ───────────────────────────────────────
/** Tempo de recarga. Segue o mesmo padrão do cooldown de `I Am Atomic`. */
export const GRAN_REY_CERO_COOLDOWN_MS = 20_000;
/** Orçamento de deslocamento: 2s de "corrida" somados ao rastejo. */
export const GRAN_REY_CERO_TRAVEL_MS = TWO_THOUSAND_MS;
/** Distância percorrida no total, em px lógicos do plano 1000x600. */
export const GRAN_REY_CERO_TRAVEL_DISTANCE = 500;
/** Intervalo entre instâncias de dano enquanto a lâmina está encostada. */
export const GRAN_REY_CERO_TICK_MS = TWO_HUNDRED_MS;
/** Instâncias de dano que encerram a lâmina. */
export const GRAN_REY_CERO_MAX_TICKS = 10;
/** Desvanecimento final: a lâmina para de machucar e some. */
export const GRAN_REY_CERO_FADE_OUT_MS = FOUR_HUNDRED_FIFTY_MS;
/** Janela com que a trava de ação é empurrada a cada quadro do rastejo. */
export const GRAN_REY_CERO_LOCK_WINDOW_MS = TWO_HUNDRED_MS;

// ── Dano e deslocamento dos inimigos ───────────────────────
/** Fração do dano base aplicada por instância (10 × 5% = 50%). */
export const GRAN_REY_CERO_DAMAGE_RATIO = 0.5;
/** Empurrão aplicado ao inimigo atingido, por instância. */
export const GRAN_REY_CERO_PUSH_PX = 20;
/** Raio (px lógicos) ao redor da lâmina que conta como "atingido". */
export const GRAN_REY_CERO_AOE_RADIUS = 50;

// ── Rastejo ───────────────────────────────────────────────
/**
 * Velocidade de rastejo em px/s: bem abaixo da corrida (250px/s) para o corte
 * "colar" no alvo sem sair do lugar, mas nunca zerar — a lâmina continua
 * avançando devagar enquanto machuca.
 */
export const GRAN_REY_CERO_CREEP_PX_PER_S = 5;

// ── Renderização ───────────────────────────────────────────
/** Dimensões reais do `granReyCeroEffect.svg`. */
export const GRAN_REY_CERO_EFFECT_WIDTH = 130.4;
export const GRAN_REY_CERO_EFFECT_HEIGHT = 192.2;
/** Mesmo rótulo do laser: sprite do marcelo renderizado a 2.5x o tile. */
export const GRAN_REY_CERO_PLAYER_SPRITE_RATIO = 2.5;
