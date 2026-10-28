export const CHARACTER_RANGE_X: Record<
  string,
  {
    normalHitRange: number;
    blockHitRange: number;
    specialHitRange: number;
  }
> = {
  drika: {
    normalHitRange: 150,
    blockHitRange: 100,
    specialHitRange: 180,
  },

  marshadow: {
    normalHitRange: 80,
    blockHitRange: 100,
    specialHitRange: 3000,
  },

  samurion: {
    normalHitRange: 100,
    blockHitRange: 100,
    specialHitRange: 180,
  },

  srGuaxinim: {
    normalHitRange: 120,
    blockHitRange: 100,
    specialHitRange: 260,
  },

  ematron: {
    normalHitRange: 160,
    blockHitRange: 100,
    specialHitRange: 320,
  },

  laricell: {
    normalHitRange: 8000,
    blockHitRange: 8000,
    specialHitRange: 8000,
  },

  yra: {
    normalHitRange: 80,
    blockHitRange: 80,
    specialHitRange: 300,
  },

  camyKaze: {
    normalHitRange: 100,
    blockHitRange: 100,
    specialHitRange: 100,
  },

  yvel: {
    normalHitRange: 80,
    blockHitRange: 80,
    specialHitRange: 280,
  },

  babidi: {
    normalHitRange: 150,
    blockHitRange: 100,
    specialHitRange: 3000,
  },

  natsuki: {
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
