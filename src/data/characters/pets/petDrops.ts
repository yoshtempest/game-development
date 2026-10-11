export type PetDropInfo = {
  npcType: string;
  npcLabel: string;
  chance: number;
};

export const PET_DROPS: Record<string, PetDropInfo> = {
  pet_goat: { npcType: "goat", npcLabel: "Bode", chance: 0.01 },
  pet_hungryDeath: {
    npcType: "hungryDeath",
    npcLabel: "Morto de Fome",
    chance: 0.05,
  },
  pet_piupiu: { npcType: "piupiu", npcLabel: "Piupiu", chance: 0.03 },
  pet_hungryKing: {
    npcType: "hungryKing",
    npcLabel: "Rei dos Mortos de Fome",
    chance: 0.01,
  },
  pet_madame: {
    npcType: "madame",
    npcLabel: "Dona Aranha",
    chance: 0.01,
  },
  pet_mosquito: {
    npcType: "mosquito",
    npcLabel: "Muriçoca Soca Soca",
    chance: 0.01,
  },
  pet_hawkMother: {
    npcType: "hawkMother",
    npcLabel: "Mãe do Hawk",
    chance: 0.01,
  },
  pet_flyingCloud: {
    npcType: "flyingCloud",
    npcLabel: "Nuvem Voadora",
    chance: 0.01,
  },
  pet_crows: {
    npcType: "crows",
    npcLabel: "2 Corvos",
    chance: 0.01,
  },
  pet_turkey: {
    npcType: "turkey",
    npcLabel: "Peru",
    chance: 0.01,
  },
  pet_crocodile: {
    npcType: "crocodile",
    npcLabel: "Crocodilo da lacoste",
    chance: 0.01,
  },
  pet_duque: {
    npcType: "duque",
    npcLabel: "Duque",
    chance: 0.01,
  },
  pet_dog: {
    npcType: "lupita",
    npcLabel: "Lupita",
    chance: 0.01,
  },
  pet_vulture: {
    npcType: "zecaUrubu",
    npcLabel: "zecaUrubu",
    chance: 0.01,
  },
  pet_cat: { npcType: "rapariga", npcLabel: "Rapariga", chance: 0.01 },
  pet_leviathan: {
    npcType: "leviathan",
    npcLabel: "Leviathan",
    chance: 0.005,
  },
};
