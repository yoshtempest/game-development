/**
 * Constantes do Marshadow (Marshadow) que o registro de habilidades precisa
 * ler. Moram em `data/` (e não nos hooks) porque `src/data/` não pode
 * depender de `src/hooks/` — o menu de Status mostra custo e cooldown.
 */

/** Cooldown da habilidade "I Am Atomic". */
export const ATOMIC_COOLDOWN_MS = 20_000;

/**
 * Reiryoku (barra de fluxo, 0..100, recarregada ao caminhar) gasto pelo
 * "I Am Atomic". É a habilidade de área mais forte fora da Forma Vastolord,
 * então custa mais que o Gran Rey Cero: duas explosões seguidas exigem andar
 * pelo mapa entre elas.
 */
export const ATOMIC_REIRYOKU_COST = 40;
