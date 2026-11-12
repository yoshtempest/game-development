export const BATTLE_SPAWN = {
  player: {
    x: 100,
    y: 550,
  },

  /**
   * Spawn do parceiro no co-op (guest). Sem um ponto próprio os dois jogadores
   * nasciam sobrepostos em `player` e o host não distinguia o avatar remoto.
   */
  coopPlayer: {
    x: 220,
    y: 550,
  },

  npc: {
    x: 900,
    y: 550,
  },
} as const;
