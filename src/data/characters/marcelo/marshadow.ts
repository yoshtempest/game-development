/**
 * Constantes do Marcelo (Marshadow) que o registro de habilidades precisa
 * ler. Moram em `data/` (e não nos hooks) porque `src/data/` não pode
 * depender de `src/hooks/` — o menu de Status mostra custo e cooldown.
 */

/** Cooldown da habilidade "I Am Atomic". */
export const ATOMIC_COOLDOWN_MS = 20_000;
