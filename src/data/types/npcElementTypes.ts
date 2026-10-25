import type { ElementType } from "@/utils/types/battle/element";

/** Pets têm elementos mas não são NPCs de batalha. */
export type PetElementKey = "turkey" | "rapariga" | "zecaUrubu" | "mosquito";

/**
 * Tipagens elementais de cada NPC.
 *
 * Fonte única de tipagem dos NPCs: `getNpcElementTypes` lê esta tabela, não uma
 * resolução indireta. A lista pode ter quantas tipagens quiser — multi-tipagem
 * elemental pura.
 *
 * `Partial` de propósito: NPC novo não é obrigado a declarar tipagem, e
 * `getNpcElementTypes` cai em `Normalis` quando a chave não existe.
 */
export const NPC_TYPINGS = {
  /* Jomasio */
  hungryDeath: ["Normalis", "Darkus"],
  piupiu: ["Ventus", "Normalis"],
  rice: ["Natura"],
  jhowsimar: ["Normalis"],
  goat: ["Normalis", "Darkus"],
  vandinhaFragment: ["Normalis", "Psychicus"],
  trueVandinha: ["Darkus", "Umbra"],
  deise: ["Normalis", "Darkus"],
  necromancer: ["Darkus", "Pyrus"],
  slimita: ["Aquos", "Umbra"],
  hungryKing: ["Umbra", "Darkus"],
  denis: ["Pyrus", "Normalis"],
  srGuaxinim: ["Normalis", "Psychicus"],
  neimito: ["Pyrus", "Psychicus"],
  planetarySisters: ["Normalis"],
  manim: ["Psychicus", "Normalis"],
  maurao: ["Pyrus", "Darkus"],
  maugrelo: ["Normalis", "Pyrus"],

  /* Bocaina */
  hungryDog: ["Normalis"],
  lupita: ["Pyrus", "Darkus"],
  duque: ["Pyrus", "Haos"],
  baiano: ["Normalis"],
  spiritMotocycler: ["Umbra", "Pyrus"],
  tim: ["Darkus", "Ventus"],
  muyMacho: ["Normalis", "Subterra"],

  /* Lagoa grande */
  hungryFish: ["Aquos"],
  hungryCow: ["Normalis", "Natura"],
  fischer: ["Normalis", "Aquos"],
  leviathan: ["Aquos", "Draco"],

  /* Cachoeiras */
  figurantOfBaalCult: ["Darkus"],
  baal: ["Darkus", "Pyrus"],
  madame: ["Natura", "Darkus"],

  /* Barragem */
  figurantOfMobyDickCult: ["Aquos", "Psychicus"],
  crocodile: ["Aquos", "Subterra"],
  elitCrocodile: ["Aquos", "Subterra"],
  mobyDick: ["Aquos", "Umbra"],
  yangKai: ["Psychicus", "Subterra"],

  /* Tanque dos crávos */
  figurantOfDragonKingCult: ["Pyrus"],
  ains: ["Darkus", "Umbra"],
  dragonKing: ["Draco", "Pyrus"],

  /* Lagoa do Canto */
  hungryPig: ["Normalis", "Subterra"],
  technoblade: ["Normalis", "Metallum"],
  ouroboros: ["Natura", "Psychicus"],

  /* Training */
  dummy: ["Normalis"],

  /* Indefinido */
  theStrongestManUnderTheHeavens: ["Normalis"],
  theBlackKnight: ["Darkus"],
  untrackedMonster: ["Darkus", "Haos"],
  theMasterPiece: ["Metallum"],
  theChaosCreator: ["Darkus"],
  theFirstNightmare: ["Draco", "Umbra"],
  theDevourerOfWorlds: ["Draco", "Darkus"],

  /* Pets (sem NPC de batalha próprio) */
  turkey: ["Normalis", "Subterra"],
  rapariga: ["Normalis", "Haos"],
  zecaUrubu: ["Normalis", "Ventus"],
  mosquito: ["Ventus", "Natura"],
} as const satisfies Partial<
  Record<NpcType | PetElementKey, readonly ElementType[]>
>;

export function getNpcElementTypes(npcType: string): readonly ElementType[] {
  const base = npcType.endsWith("_alfa") ? npcType.slice(0, -5) : npcType;
  return NPC_TYPINGS[base as keyof typeof NPC_TYPINGS] ?? ["Normalis"];
}
