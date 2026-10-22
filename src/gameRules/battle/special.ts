/**
 * Carga da Expansão de Domínio.
 *
 * O deliciômetro virou a barra desta habilidade: o special saiu do recurso e
 * ganhou cooldown próprio, e a barra agora só cresce (ataque básico +1,
 * uso de habilidade +5) até as 40 cargas, que a Expansão consome por inteiro.
 * O valor é fixo para todo mundo — o antigo getMaxSpecial variava por classe
 * (fracote 7, default 9) e personagem (artur 1.5x).
 */
export const DOMAIN_EXPANSION_MAX_CHARGES = 0;

/**
 * Carga que o uso de uma habilidade ativa rende à barra (ver
 * `gainAbilityCharge`). O ataque básico continua em +1 (`gainSpecial`).
 */
export const ABILITY_CHARGE_GAIN = 5;

export function getMaxSpecial() {
  return DOMAIN_EXPANSION_MAX_CHARGES;
}

/** +1 de carga — ataque básico (e golpes especiais de summon/dash/parry). */
export function gainSpecial(current: number, max: number) {
  return Math.min(current + 1, max);
}

/** +5 de carga — uso de uma habilidade ativa (botão na tela). */
export function gainAbilityCharge(current: number, max: number, times = 1) {
  return Math.min(current + ABILITY_CHARGE_GAIN * times, max);
}
