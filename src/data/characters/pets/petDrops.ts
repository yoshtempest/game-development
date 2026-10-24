export type PetDropInfo = {
  npcType: string;
  npcLabel: string;
  chance: number;
  riddle?: string;
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
    chance: 0,
    riddle: "O caos encarnado pode ser encontrado onde nunca se foi pensado.",
  },
  pet_flyingCloud: {
    npcType: "flyingCloud",
    npcLabel: "Nuvem Voadora",
    chance: 0,
    riddle:
      "Leve como o suspiro do vento, ela carrega quem tem o coração puro. Não se prende ao chão, só à promessa.",
  },
  pet_crows: {
    npcType: "crows",
    npcLabel: "2 Corvos",
    chance: 0,
    riddle:
      "Dois olhos negros observam da janela do tempo. Um guarda o passado, o outro, o futuro. Juntos, nunca se separam.",
  },
  pet_aerosmith: {
    npcType: "aerosmith",
    npcLabel: "Aerosmith",
    chance: 0,
    riddle:
      "O som que perfura o silêncio vem de asas metálicas. Quem ousa afinar a frequência da liberdade?",
  },
  pet_mahoraga: {
    npcType: "mahoraga",
    npcLabel: "Mahoraga",
    chance: 0,
    riddle:
      "A roda gira, imune a tudo que já foi visto. Adaptar-se é a única lei. Quem gira a roda?",
  },
  pet_turkey: {
    npcType: "turkey",
    npcLabel: "Peru",
    chance: 0,
    riddle: "Tu gosta?",
  },
  pet_crocodile: {
    npcType: "crocodile",
    npcLabel: "Crocodilo da lacoste",
    chance: 0,
    riddle:
      "Veste a marca do estilo, mas morde com elegância. No pântano da moda, só os autênticos sobrevivem.",
  },
  pet_duque: {
    npcType: "duque",
    npcLabel: "Duque",
    chance: 0,
    riddle:
      "A coroa não pesa em quem nasceu para reinar. O verdadeiro nobre não pede permissão para existir.",
  },
  pet_lupita: {
    npcType: "lupita",
    npcLabel: "Lupita",
    chance: 0,
    riddle: "Entre a luz da lua e a sombra da noite, ela destroi.",
  },
  pet_vulture: {
    npcType: "zecaUrubu",
    npcLabel: "zecaUrubu",
    chance: 0.01,
  },
  pet_rapariga: {
    npcType: "rapariga",
    npcLabel: "Rapariga",
    chance: 0,
    riddle: "Ela não pede, implora, tudo por uma comida.",
  },
  pet_leviathan: {
    npcType: "leviathan",
    npcLabel: "Leviathan",
    chance: 0.005,
  },
};
