/**
 * Som genérico tocado quando um NPC dispara um projétil sem ter tocado um som
 * próprio no mesmo tick. O mapa de batalha é maior que a tela, então o jogador
 * precisa ouvir o ataque à distância para se preparar mesmo sem ver a animação.
 */
export const RANGED_ATTACK_CUE_SOUND: SoundId = "whooshWind";

/**
 * Intervalo mínimo entre dois avisos genéricos do mesmo NPC. Rajadas (vários
 * projéteis em sequência) viram um único aviso em vez de empilhar o mesmo som.
 */
export const RANGED_ATTACK_CUE_COOLDOWN_MS = 800;
