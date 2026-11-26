import { ONE_THOUSAND_MS, TWO_HUNDRED_FIFTY_MS } from "@/data/ms";

/**
 * Números do Rick Tóxico (issue #458). Ficam em `data/` e não no arquivo de
 * ataque porque três camadas diferentes leem a mesma regra: o ataque (fumaça),
 * o pipeline de projétil do `useAi` (veneno do frasco) e o `useBattleCore`
 * (passiva sobre o básico do jogador). Duplicar a chance em cada lugar seria
 * o primeiro passo para elas divergirem no balanceamento.
 */

/** Chance de o frasco envenenar ao acertar o jogador (5%, pela issue). */
export const RICK_FLASK_POISON_CHANCE = 0.05;

/**
 * Passiva: chance de envenenar o jogador a cada ataque básico que ele dá no
 * Rick (2%, pela issue). Só o básico conta — special e habilidades não.
 */
export const RICK_PASSIVE_POISON_CHANCE = 0.02;

/**
 * Duração da fumaça que sobe do frasco quebrado. A issue pede "vários ticks
 * de pouquíssimo dano"; 1s com tick de 250ms dá quatro ticks por frasco.
 * Decisão para revisar no PR.
 */
export const RICK_SMOKE_DURATION_MS = ONE_THOUSAND_MS;

/** Intervalo entre ticks de dano da fumaça. */
export const RICK_SMOKE_TICK_MS = TWO_HUNDRED_FIFTY_MS;

/**
 * Multiplicador de cada tick da fumaça sobre o golpe base do NPC. Baixo de
 * propósito: os quatro ticks somados ficam abaixo de meio golpe.
 */
export const RICK_SMOKE_TICK_MULTIPLIER = 0.1;

/**
 * Meia largura (px) da nuvem de fumaça. O jogador que sai dessa faixa para de
 * tomar tick — a fumaça fica onde o frasco quebrou, não segue o alvo.
 */
export const RICK_SMOKE_RADIUS = 60;
