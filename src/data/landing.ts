import {
  jomasioPath,
  playerPath,
  npcPath,
  itemPath,
  rootAssetPath,
} from "@/utils/paths";

export const locations = [
  { name: "Hall", image: jomasioPath("/hall/one.svg") },
  { name: "Cantina", image: jomasioPath("/cantina.svg") },
  { name: "Biblioteca", image: jomasioPath("/library/default.svg") },
  { name: "Sala dos PCs", image: jomasioPath("/pcsRoom.svg") },
  { name: "Quadra", image: jomasioPath("/footballCourt.svg") },
  { name: "Cafeteria", image: jomasioPath("/cafeteria.svg") },
];

export const bosses = [
  {
    name: "Jailson",
    image: npcPath("/jailson/default.svg"),
    desc: "O rei da delícia",
  },
  {
    name: "Irmãs Planetárias",
    image: npcPath("/planetarySisters/mary.svg"),
    desc: "Guardiãs do centro",
  },
  {
    name: "Maurão",
    image: npcPath("/maurao/default.svg"),
    desc: "A fera do pandemônio",
  },
  {
    name: "Vandinha",
    image: npcPath("/vandinhaFragment/default.svg"),
    desc: "Fragmento sombrio",
  },
  {
    name: "JhowSimar",
    image: npcPath("/jhowsimar/default.svg"),
    desc: "O lendário porteiro",
  },
  {
    name: "Hungry King",
    image: npcPath("/hungryKing/default.svg"),
    desc: "Rei da fome",
  },
  {
    name: "Juan Derson",
    image: npcPath("/janderson/right.svg"),
    desc: "Professor do café",
  },
  {
    name: "Bode",
    image: npcPath("/goat/default.svg"),
    desc: "Cardápio principal",
  },
];

export const characters = [
  {
    name: "Marshadow",
    image: playerPath("/marshadow/expressions/default.svg"),
    class: "Espadachim",
  },
  {
    name: "SrGuaxinim",
    image: playerPath("/srGuaxinim/expressions/default.svg"),
    class: "Explosivo",
  },
  {
    name: "Drika",
    image: playerPath("/drika/expressions/default.svg"),
    class: "Inquisidora",
  },
  {
    name: "Natsuki",
    image: playerPath("/natsuki/expressions/default.svg"),
    class: "Tanque",
  },
  {
    name: "Ematron",
    image: playerPath("/ematron/expressions/default.svg"),
    class: "Atacante",
  },
  {
    name: "Yvel",
    image: playerPath("/yvel/expressions/default.svg"),
    class: "Boxeador",
  },
  {
    name: "Babidi n.º 78==Dζ3",
    image: playerPath("/babidi/default.svg"),
    class: "Versátil",
  },
  {
    name: "Laricell",
    image: playerPath("/laricell/default.svg"),
    class: "Atiradora",
  },
  {
    name: "CamyKaze",
    image: playerPath("/camyKaze/default.svg"),
    class: "Lutadora",
  },
  {
    name: "Samurion",
    image: playerPath("/samurion/default.svg"),
    class: "Berserker",
  },
  { name: "Y.R.A", image: playerPath("/yra/default.svg"), class: "DPS" },
];

export const funnyMoments = [
  {
    title: "O Peru",
    desc: "Tu num é nem gente Peru! Glu Glu Glu Glu Glu",
    image: itemPath("peru.svg"),
  },
  {
    title: "Deliciômetro",
    desc: "Meça o nível de delícia da sua gameplay com este medidor sagrado.",
    image: rootAssetPath("deliciometro.svg"),
  },
  {
    title: "Morto de Fome",
    desc: "É duas fungada e a comida se acaba, é duas pedalada e a corrente cai.",
    image: npcPath("/hungryDeath/face.svg"),
  },
  {
    title: "Leite Suspeito",
    desc: "Achou um leite na cantina? Melhor pensar duas vezes antes de beber.",
    image: itemPath("suspect_milk.svg"),
  },
];
