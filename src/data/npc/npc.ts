// Tabela chave → classe. A union NpcType é derivada daqui, então adicionar um
// NPC aqui automaticamente o torna válido em todo o app (e typos de classe
// quebram a compilação via `satisfies`).
export const NPC_CLASSES = {
  /* Jomasio */
  hungryDeath: "common",
  piupiu: "rare",
  rice: "common",
  jhowsimar: "rare",
  goat: "rare",
  vandinhaFragment: "epic",
  trueVandinha: "legendary",
  deise: "boss",
  necromancer: "boss",
  slimita: "boss",
  hungryKing: "boss" /* culto de Samurion */,
  denis: "boss",
  srGuaxinim: "epic",
  neimito: "boss",
  planetarySisters: "boss",
  manim: "boss",
  maurao: "boss",
  maugrelo: "boss",

  /* Bocaina */
  hungryDog: "common",
  lupita: "boss",
  duque: "epic",
  baiano: "epic",
  spiritMotocycler: "boss" /* Juan Derson */,
  tim: "boss" /* Assassino que pula e faz acrobacias com as 2 facas de sashimi*/,
  muyMacho: "boss",

  /* Lagoa grande */
  hungryFish: "common",
  hungryCow: "common",
  fischer: "rare",
  leviathan: "boss",
  /* Cachoeiras */
  figurantOfBaalCult: "common",
  baal: "legendary",
  madame: "legendary" /* aranha de cão de caça dos baskerville */,
  /* Barragem */
  figurantOfMobyDickCult: "common",
  crocodile: "rare",
  elitCrocodile: "epic",
  mobyDick: "boss" /* baleia */,
  yangKai: "legendary",
  /* Tanque dos crávos */
  figurantOfDragonKingCult: "common",
  ains: "boss" /* OVERLORD */,
  dragonKing: "legendary",
  /* Lagoa do Canto */
  hungryPig: "common",
  technoblade: "legendary",
  ouroboros: "supreme",

  /* Training */
  dummy: "common",

  /* Indefinido */

  theDevourerOfWorlds: "legendary",
  theStrongestManUnderTheHeavens: "legendary",
  theBlackKnight: "legendary",
  untrackedMonster: "legendary",
  theMasterPiece: "legendary",
  theChaosCreator: "legendary",
  theFirstNightmare: "legendary",
} as const satisfies Record<string, NPCClass>;

export type NpcType = keyof typeof NPC_CLASSES;

export type NPCData = {
  type: NpcType;
  class: NPCClass;
};

export const NPCS = Object.fromEntries(
  Object.entries(NPC_CLASSES).map(([type, npcClass]) => [
    type,
    { type, class: npcClass },
  ]),
) as Record<NpcType, NPCData>;

export function isNpcType(value: unknown): value is NpcType {
  return typeof value === "string" && value in NPC_CLASSES;
}

/*
Personagens que fazem parte do culto de Baal 
  1 - figurantOfBaalCult
  2 - Goat
  3 - SrGuaxinim
  4 - Tim
  5 - baal
*/

/*
Personagens que fazem parte do culto ao rei dragão 
  1 - figurantOfDragonKingCult
  2 - Deise
  3 - Ains
  4 - hungryKing
  5 - dragonKing
*/
