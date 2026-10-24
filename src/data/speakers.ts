export const SPEAKERS = {
  protagonista: { name: "Protagonista", isPlayer: true },
  duqueSe: { name: "Duque Sê" },

  jailson: { name: "Jailson", base: "/jailson", pose: "right" },
  slimita: { name: "Slimita", base: "/slimita", pose: "right" },
  neimito: { name: "Neimito", base: "/neimito", pose: "right" },
  remedinha: { name: "Remedinha", base: "/remedinha", pose: "right" },
  deise: { name: "Coquus Necromanticus", base: "/deise", pose: "right" },
  denis: { name: "Denis", base: "/denis", pose: "angry" },
  victor: { name: "Victor", base: "/victor", pose: "sitting" },
  juju: { name: "Juju", base: "/juju", pose: "right" },
  jhowSimar: { name: "Jhow Simar", base: "/jhowsimar", pose: "right" },
  jeso: { name: "Jeso", base: "/jeso", pose: "default" },
  brotherOne: { name: "???", base: "/brothers", pose: "one" },
  brotherTwo: { name: "???", base: "/brothers", pose: "two" },

  laricell: {
    name: "Laricell",
    kind: "player",
    base: "/larissa",
    pose: "expressions/default",
  },
  drika: { name: "Drika", base: "/characters/drika", pose: "default" },
  marshadow: {
    name: "Marshadow",
    base: "/characters/marshadow",
    pose: "defeat",
  },
  yvel: {
    name: "Yvel",
    kind: "player",
    base: "/characters/lucas",
    pose: "default",
  },
  samurion: {
    name: "Samurion",
    base: "/samuel",
    pose: "default",
  },
  ematron: {
    name: "Ematron",
    base: "/emanuel",
    pose: "default",
  },

  solSol: { name: "Sol Sol", base: "/solange", pose: "right" },
  maria: { name: "Maria", base: "/planetarySisters", pose: "mary" },
  nelit: { name: "Maria 2", base: "/planetarySisters", pose: "nelit" },
  irmaasPlanetarias: {
    name: "Irmãs Planetárias",
    base: "/mariMarques",
    pose: "right",
  },
  blackao: { name: "Negão do Ferro Velho", base: "/blackao", pose: "right" },
  leo: { name: "Léo", base: "/leo", pose: "right" },
  maurao: { name: "Maurão", base: "/maurao", pose: "default" },
  maugrelo: { name: "Maugrelo", base: "/maugrelo", pose: "right" },
  homemDesconhecido: {
    name: "Homem desconhecido",
    base: "/peruFather",
    pose: "right",
  },
  kidBengala: { name: "Kid Bengala", base: "/kidBengala", pose: "terror" },
  zeOfBraga: { name: "Zé do Braga", base: "/zeOfBraga", pose: "right" },
  tiadorim: { name: "Tiadorim", base: "/tiadorim", pose: "right" },
  zeOfMilk: { name: "zeOfMilk", base: "/zeOfMilk", pose: "right" },

  reiMortosFome: {
    name: "Rei dos Mortos de Fome",
    base: "/hungryKing",
    pose: "default",
  },
  mortoDeFome: { name: "Morto de fome", base: "/hungryDeath", pose: "right" },
  caoFaminto: { name: "Cão Faminto", base: "/hungryDog", pose: "walk" },
  fragmentoVandinha: {
    name: "Fragmento de Vandinha",
    base: "/vandinhaFragment",
    pose: "right",
  },
  juanDerson: { name: "Juan Derson", base: "/janderson", pose: "right" },
  rapariga: { name: "Rapariga", base: "/rapariga", pose: "default" },
  rickPrime: { name: "Rick prime", base: "/rickPrime", pose: "right" },

  surica: { name: "Surica", base: "/surica", pose: "default" },
  suricaIncrivel: {
    name: "Surica, o Incrível",
    base: "/surica",
    pose: "right",
  },
  ramon: { name: "Rámon, o Rei Dragão", base: "/dragonKing", pose: "right" },
  figurante: {
    name: "Figurante",
    base: "/figurantOfDragonKingCult",
    pose: "right",
  },
  reincardion: { name: "Reincardion", base: "/reincardion", pose: "right" },

  sistema: { name: "Sistema" },
  sistemaJanela: { name: "Sistema", base: "/system", pose: "right" },
  janelaSistema: { name: "Janela de Sistema", base: "/system", pose: "right" },
} as const;

export type SpeakerId = Extract<keyof typeof SPEAKERS, string>;
