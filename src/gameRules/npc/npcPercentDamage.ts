/**
 * Converte uma fração do dano base do NPC em dano absoluto.
 *
 * Ponto único para todo dano de NPC que antes era um número fixo (ticks de
 * sangramento/queimadura/veneno): como o dano base sai de `getNpcStats` e já
 * carrega nível, classe, dificuldade, coop/alfa e o multiplicador próprio do
 * tipo, o efeito escala junto com o NPC em vez de ficar irrelevante quando
 * ele subir de nível. O piso de 1 preserva a regra de que um tick sempre
 * tira vida — sem ele, NPC fraco com fração baixa arredondaria para 0.
 *
 * @param baseDamage dano base do NPC (`getNpcStats(...).damage`).
 * @param ratio fração do dano base (0.4 = 40%).
 * @returns dano inteiro, nunca menor que 1.
 */
export function getNpcPercentDamage(baseDamage: number, ratio: number): number {
  return Math.max(1, Math.round(baseDamage * ratio));
}
