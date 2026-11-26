/**
 * Tuning da Bankai do marshadow (#424, árvore "Ichigo" de #405).
 *
 * Mora em `data/` porque três consumidores leem os mesmos números: o registro
 * de habilidades (descrição no menu de Status), o hook `useBankai` (duração e
 * cooldown) e o multiplicador de dano injetado no funil (`useBattlePresentation`).
 *
 * Decisão para revisar: todos os valores abaixo são o primeiro corte de
 * balanceamento, sem referência numérica na issue.
 */

/** Quanto tempo a liberação dura, em ms de batalha (pausa congela). */
export const BANKAI_DURATION_MS = 12_000;
/**
 * Recarga contada a partir do `press`. Maior que a duração de propósito: a
 * Bankai é janela de pico, não estado permanente.
 */
export const BANKAI_COOLDOWN_MS = 40_000;
/**
 * Multiplicador de TODO dano do marshadow enquanto a Bankai está ativa. Entra
 * pelo mesmo ref da Forma Vastolord (`vastolordMultiplierRef`), então básico,
 * special, dash e habilidades já o recebem sem caminho novo de dano.
 */
export const BANKAI_DAMAGE_MULTIPLIER = 1.5;
/** Lock de ação do player durante o grito da liberação. */
export const BANKAI_RELEASE_LOCK_MS = 600;
/** Intervalo do relógio da duração (o mesmo passo da Forma Vastolord). */
export const BANKAI_TICK_MS = 100;
