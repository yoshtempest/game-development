/**
 * Tuning da Forma Vastolord do marshadow (passiva `vastolordForm`).
 *
 * Mora em `data/` (e não no hook `useVastolordForm`) porque dois consumidores
 * distintos leem os mesmos números: o grito da transformação (empurrão dos
 * inimigos, hook `useVastolordRoar`) e o vampirismo universal injetado no funil
 * de dano (`useSystem`). A duração e o multiplicador de dano/armadura continuam
 * no hook, onde nasceram.
 */

// ── Grito (empurrão dos inimigos) ─────────────────────────
/**
 * Alcance horizontal do grito, em px do plano 1000x600. Enquanto o inimigo
 * estiver dentro dele é empurrado para longe, 1px por tick; ao cruzar o limite
 * o grito deixa de alcançá-lo. É o raio que produz a queda por proximidade: quem
 * está colado atravessa os 200px inteiros, quem já está na beirada quase não sai
 * do lugar. Também é o teto de deslocamento do grito (até 200px).
 */
export const VASTOLORD_ROAR_RADIUS_PX = 200;
/** Intervalo do empurrão contínuo enquanto o Vastolord grita. */
export const VASTOLORD_ROAR_TICK_MS = 10;
/** Deslocamento por tick, em px. Contínuo (não instantâneo) durante o grito. */
export const VASTOLORD_ROAR_PUSH_PER_TICK_PX = 1;
/**
 * Quantos quadros da transformação são grito (`screamOne/Two/Three`). O quadro
 * seguinte (`transformated`, índice 3) já é silêncio — o empurrão e o tremor de
 * câmera param nele.
 */
export const VASTOLORD_ROAR_SCREAM_FRAMES = 3;

// ── Vampirismo ────────────────────────────────────────────
/**
 * Vampirismo universal da forma: 10% de QUALQUER dano causado pelo marshadow
 * (básico, special e habilidades) vira cura enquanto a forma estiver ativa.
 * Soma ao universal vindo de equipamento e desaparece quando a forma acaba.
 */
export const VASTOLORD_UNIVERSAL_VAMPIRISM = 10;
