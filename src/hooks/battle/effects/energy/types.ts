export type EnergyState = {
  /** Caracteres sem barra de energia não usam o sistema. */
  enabled: boolean;
  /** 0..100. Sempre 100 para personagens sem energia. */
  energy: number;
  /** Reseta a barra (uso no reset da batalha). */
  resetEnergy: () => void;
  /** Zera a barra e concede escudo caso esteja cheia (ao receber dano). */
  consumeOnDamage: () => void;
};
