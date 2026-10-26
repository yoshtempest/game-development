export const NPC_ALFAS = {
  edson: {
    baseNpcType: "hungryDeath",
    name: "Edson",
  },
  blackMouth: {
    baseNpcType: "hungryDog",
    name: "Black Mouth",
  },
  wandinha: {
    baseNpcType: "vandinhaFragment",
    name: "Vandinha Dark Era",
  },
  kingGoat: {
    baseNpcType: "goat",
    name: "King Bodão",
  },
  kingPiu: {
    baseNpcType: "piupiu",
    name: "Rei Piu",
  },
  friedRice: {
    baseNpcType: "rice",
    name: "Arroz Frito",
  },
} as const;

export type NpcAlfaId = keyof typeof NPC_ALFAS;

export function getNpcAlfaData(npcType: string) {
  if (Object.hasOwn(NPC_ALFAS, npcType)) {
    return NPC_ALFAS[npcType as NpcAlfaId];
  }

  return undefined;
}
