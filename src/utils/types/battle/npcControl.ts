/**
 * Barreira vertical da arena (a Parede de Gelo da Laricell): uma faixa em x,
 * `[x - halfWidth, x + halfWidth]`, que o NPC não atravessa e onde todo
 * projétil inimigo se parte. `until` é o deadline em `Date.now()`.
 */
export type BattleBarrier = {
  x: number;
  halfWidth: number;
  until: number;
};

/**
 * Cegueira aplicada ao NPC (a Bomba de Fumaça): enquanto `until` não vence,
 * cada golpe do NPC tem `missChance` de errar. Fica num ref (e não em estado)
 * porque a IA consulta a cada golpe, dentro do tick de 20ms.
 */
export type NpcBlind = {
  until: number;
  missChance: number;
};
