export const CHARACTER_RANGE_X: Record<
  string,
  {
    normalHitRange: number;
    blockHitRange: number;
    specialHitRange: number;
  }
> = {
  eduarda: {
    normalHitRange: 150,
    blockHitRange: 100,
    specialHitRange: 180,
  },

  marcelo: {
    normalHitRange: 80,
    blockHitRange: 100,
    specialHitRange: 3000,
  },

  samuel: {
    normalHitRange: 100,
    blockHitRange: 100,
    specialHitRange: 180,
  },

  artur: {
    normalHitRange: 120,
    blockHitRange: 100,
    specialHitRange: 260,
  },

  emanuel: {
    normalHitRange: 160,
    blockHitRange: 100,
    specialHitRange: 320,
  },

  larissa: {
    normalHitRange: 8000,
    blockHitRange: 8000,
    specialHitRange: 8000,
  },

  mayra: {
    normalHitRange: 80,
    blockHitRange: 80,
    specialHitRange: 300,
  },

  camilly: {
    normalHitRange: 100,
    blockHitRange: 100,
    specialHitRange: 100,
  },

  lucas: {
    normalHitRange: 80,
    blockHitRange: 80,
    specialHitRange: 280,
  },

  lucaua: {
    normalHitRange: 150,
    blockHitRange: 100,
    specialHitRange: 3000,
  },

  riquelme: {
    normalHitRange: 90,
    blockHitRange: 90,
    specialHitRange: 3000,
  },

  levi: {
    normalHitRange: 80,
    blockHitRange: 80,
    specialHitRange: 300,
  },
};

export const NPC_CLASS_HITBOX_BONUS: Record<NPCClass, number> = {
  common: 0,
  rare: 30,
  epic: 50,
  boss: 80,
  legendary: 120,
  supreme: 200,
  omega: 300,
};

/** Bônus vertical (altura) da hitbox por classe — cobre o topo do pulo do jogador. */
export const NPC_CLASS_VERTICAL_BONUS: Record<NPCClass, number> = {
  common: 0,
  rare: 30,
  epic: 60,
  boss: 150,
  legendary: 200,
  supreme: 300,
  omega: 400,
};
