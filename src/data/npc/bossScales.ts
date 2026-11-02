export const bossScales: Record<string, { base: number; phase2: number }> = {
  deise: { base: 1.8, phase2: 2.6 },
  slimita: { base: 1.6, phase2: 2.2 },
  hungryKing: { base: 2, phase2: 2.2 },
  maurao: { base: 1.5, phase2: 1.8 },
  maugrelo: { base: 1, phase2: 1 },
  trueVandinha: { base: 1, phase2: 1.3 },
};

/** Fração do container que fica abaixo dos pés do personagem (letterboxing). */
export const npcSpriteYOffset: Record<string, number> = {
  hungryKing: 0.2,
};
