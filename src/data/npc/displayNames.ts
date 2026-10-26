import { isNpcType } from "@/data/npc/npc";
const NPC_DISPLAY_NAMES: Record<NpcType, string> = {
  vandinhaFragment: "Fragmento de Vandinha",
  trueVandinha: "Verdadeira Vandinha",
  slimita: "Slimita",
  hungryDeath: "Morto de Fome",
  hungryKing: "Rei Faminto",
  hungryDog: "Cachorro Faminto",
  hungryFish: "Peixe Faminto",
  hungryCow: "Vaca Faminta",
  hungryPig: "Porco Faminto",
  jhowsimar: "Jhowsimar",
  goat: "Bode",
  deise: "Deise",
  denis: "Denis",
  srGuaxinim: "Sr. Guaxinim",
  neimito: "Neimito",
  planetarySisters: "Irmãs Planetárias",
  manim: "Manim",
  maurao: "Maurão",
  maugrelo: "Maugrelo",
  lupita: "Lupita",
  duque: "Cachorro de Natsuki",
  baiano: "Baiano",
  spiritMotocycler: "Motoqueiro Fantasma",
  tim: "Tim",
  muyMacho: "Muy Macho",
  fischer: "Fischer",
  leviathan: "Leviathan",
  figurantOfBaalCult: "Figurante do Culto de Baal",
  baal: "Baal",
  madame: "Madame",
  figurantOfMobyDickCult: "Figurante do Culto de Moby Dick",
  crocodile: "Crocodilo",
  elitCrocodile: "Crocodilo de Elite",
  mobyDick: "Moby Dick",
  yangKai: "Yang Kai",
  figurantOfDragonKingCult: "Figurante do Culto do Rei Dragão",
  ains: "Ains",
  dragonKing: "Rei Dragão",
  technoblade: "Technoblade",
  dummy: "Boneco de Treino",
  piupiu: "Piupiu",
  rice: "Rice",
  necromancer: "Necromante",
  theStrongestManUnderTheHeavens: "O homem mais forte abaixo dos céus",
  theBlackKnight: "O cavaleiro negro",
  untrackedMonster: "monstro não encontrado",
  theMasterPiece: "A obra-prima",
  theChaosCreator: "O criador do caos",
  theFirstNightmare: "O primeiro pesadelo",
  theDevourerOfWorlds: "O devorador de mundos",
  ouroboros: "Ouroboros",
};

/**
 * Nome próprio dos NPCs alfa, no lugar do prefixo "ALFA ".
 * Sem entrada aqui, o alfa cai no fallback `ALFA <nome>`.
 */
const NPC_ALFA_NAMES: Partial<Record<NpcType, string>> = {
  hungryDeath: "Edson",
  hungryDog: "Black Mouth",
  vandinhaFragment: "Vandinha Fragmentada",
  goat: "King Bodão",
  piupiu: "Rei Piu",
  rice: "Arroz Frito",
};

export function getNpcDisplayName(npcType: string, isAlfa = false): string {
  if (!isNpcType(npcType)) return npcType;
  const base = NPC_DISPLAY_NAMES[npcType] ?? npcType;
  if (!isAlfa) return base;
  return NPC_ALFA_NAMES[npcType] ?? `ALFA ${base}`;
}
