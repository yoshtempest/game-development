import type { NpcLocation } from "@/utils/types/player/bestiary";

export type PetDropInfo = {
  npcType: string;
  npcLabel: string;
  chance: number;
  riddle?: string;
  location?: NpcLocation;
};

export const PET_DROPS: Record<string, PetDropInfo> = {
  pet_goat: {
    npcType: "goat",
    npcLabel: "Bode",
    chance: 0.01,
    location: "Jomasio",
  },
  pet_hungryDeath: {
    npcType: "hungryDeath",
    npcLabel: "Morto de Fome",
    chance: 0.05,
    location: "Jomasio",
  },
  pet_piupiu: {
    npcType: "piupiu",
    npcLabel: "Piupiu",
    chance: 0.03,
    location: "Jomasio",
  },
  pet_hungryKing: {
    npcType: "hungryKing",
    npcLabel: "Rei dos Mortos de Fome",
    chance: 0.01,
    location: "Jomasio",
  },
  pet_madame: {
    npcType: "madame",
    npcLabel: "Dona Aranha",
    chance: 0.01,
    location: "Jomasio",
  },
  pet_mosquito: {
    npcType: "mosquito",
    npcLabel: "Muriçoca Soca Soca",
    chance: 0.01,
    location: "Jomasio",
  },
  pet_hawkMother: {
    npcType: "hawkMother",
    npcLabel: "Mãe do Hawk",
    chance: 0,
    riddle: "O caos encarnado pode ser encontrado onde nunca se foi pensado.",
    location: "Tanque dos Crávos",
  },
  pet_flyingCloud: {
    npcType: "flyingCloud",
    npcLabel: "Nuvem Voadora",
    chance: 0,
    riddle:
      "Leve como o suspiro do vento, ela carrega quem tem o coração puro. Não se prende ao chão, só à promessa.",
    location: "Lagoa Grande",
  },
  pet_crows: {
    npcType: "crows",
    npcLabel: "2 Corvos",
    chance: 0,
    riddle:
      "Dois olhos negros observam da janela do tempo. Um guarda o passado, o outro, o futuro. Juntos, nunca se separam.",
    location: "Barragem",
  },
  pet_aerosmith: {
    npcType: "aerosmith",
    npcLabel: "Aerosmith",
    chance: 0,
    riddle:
      "O som que perfura o silêncio vem de asas metálicas. Quem ousa afinar a frequência da liberdade?",
    location: "Cachoeiras",
  },
  pet_mahoraga: {
    npcType: "mahoraga",
    npcLabel: "Mahoraga",
    chance: 0,
    riddle:
      "A roda gira, imune a tudo que já foi visto. Adaptar-se é a única lei. Quem gira a roda?",
    location: "Jomasio",
  },
  pet_turkey: {
    npcType: "turkey",
    npcLabel: "Peru",
    chance: 0,
    riddle: "Tu gosta?",
    location: "Jomasio",
  },
  pet_crocodile: {
    npcType: "crocodile",
    npcLabel: "Crocodilo da lacoste",
    chance: 0,
    riddle:
      "Veste a marca do estilo, mas morde com elegância. No pântano da moda, só os autênticos sobrevivem.",
    location: "Tanque dos Crávos",
  },
  pet_duque: {
    npcType: "duque",
    npcLabel: "Duque",
    chance: 0,
    riddle:
      "A coroa não pesa em quem nasceu para reinar. O verdadeiro nobre não pede permissão para existir.",
    location: "Lagoa do Canto",
  },
  pet_lupita: {
    npcType: "lupita",
    npcLabel: "Lupita",
    chance: 0,
    riddle: "Entre a luz da lua e a sombra da noite, ela destroi.",
    location: "Lagoa Grande",
  },
  pet_vulture: {
    npcType: "zecaUrubu",
    npcLabel: "zecaUrubu",
    chance: 0.01,
    location: "Cachoeiras",
  },
  pet_rapariga: {
    npcType: "rapariga",
    npcLabel: "Rapariga",
    chance: 0,
    riddle: "Ela não pede, implora, tudo por uma comida.",
    location: "Jomasio",
  },
  pet_leviathan: {
    npcType: "leviathan",
    npcLabel: "Leviathan",
    chance: 0.005,
    location: "Tanque dos Crávos",
  },
};
