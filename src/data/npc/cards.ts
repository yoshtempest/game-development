import type { CharacterStats } from "@/data/characters/defaultProgress";

export type NpcCard = {
  id: string;
  npcType: string;
  name: string;
  npcClass: NPCClass;
  description: string;
  attack: number;
  defense: number;
  code: string;
  reward: CardReward;
};

/**
 * Stats que uma carta pode conceder.
 *
 * São pontos de stat do PERSONAGEM, não stats de equipamento — por isso o tipo
 * vem de `CharacterStats` e não de `StatBlock`. A vida entra por `resistance`
 * porque o stat `hp` saiu do menu quando a vida virou derivada da Resistência.
 * `armor` é o único campo de equipamento que sobrou aqui: nenhum caminho de
 * resgate consome os stats da carta, então o valor é só exibição.
 */
type CardStatReward = Partial<
  Pick<
    CharacterStats,
    "strength" | "resistance" | "technique" | "spirit" | "tenacity" | "luck"
  > & {
    armor: number;
  }
>;

export type CardReward = {
  stats?: CardStatReward;
  coins?: number;
  hyperCoins?: number;
  items?: { id: string; qty?: number }[];
  equipment?: EquipmentDropInfo[];
  characterUnlock?: string;
};

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function statInRange(
  npcType: string,
  min: number,
  max: number,
  seed: number,
): number {
  const h = hashCode(npcType + seed);
  return min + (h % (max - min + 1));
}

const CLASS_RANGES: Record<
  NPCClass,
  { atk: [number, number]; def: [number, number] }
> = {
  common: { atk: [80, 299], def: [40, 199] },
  rare: { atk: [200, 499], def: [150, 399] },
  epic: { atk: [400, 699], def: [300, 599] },
  boss: { atk: [600, 899], def: [500, 799] },
  legendary: { atk: [800, 999], def: [700, 999] },
  supreme: { atk: [9999, 9999], def: [9999, 9999] },
  omega: { atk: [99999, 99999], def: [99999, 99999] },
};

function makeCard(
  npcType: string,
  name: string,
  npcClass: NPCClass,
  description: string,
  code: string,
  reward: CardReward,
): NpcCard {
  const r = CLASS_RANGES[npcClass];
  return {
    id: `card_${npcType}`,
    npcType,
    name,
    npcClass,
    description,
    attack: statInRange(npcType, r.atk[0], r.atk[1], 1),
    defense: statInRange(npcType, r.def[0], r.def[1], 2),
    code,
    reward,
  };
}

export const NPC_CARDS: Record<string, NpcCard> = {
  hungryDeath: makeCard(
    "hungryDeath",
    "Carta de Morto de Fome",
    "common",
    "Ele não quer seu sangue. Ele quer seu lanche.",
    "1000000001",
    { coins: 50, stats: { resistance: 1, strength: 1 } },
  ),
  rice: makeCard(
    "rice",
    "Carta de Bolinho de Arroz",
    "common",
    "Não é food. É um estilo de vida.",
    "1000000002",
    { coins: 50, stats: { resistance: 1, technique: 1 } },
  ),
  hungryDog: makeCard(
    "hungryDog",
    "Carta de Cachorro Faminto",
    "common",
    "Só queria um osso. Recebeu um soco.",
    "1000000003",
    { coins: 50, stats: { strength: 2 } },
  ),
  hungryFish: makeCard(
    "hungryFish",
    "Carta de Peixe Faminto",
    "common",
    "Tão fraco que morre afogado.",
    "1000000004",
    { coins: 50, stats: { resistance: 2 } },
  ),
  hungryCow: makeCard(
    "hungryCow",
    "Carta de Vaca Faminta",
    "common",
    "Moo? Mais como... morreu.",
    "1000000005",
    { coins: 75, stats: { resistance: 2, strength: 1 } },
  ),
  hungryPig: makeCard(
    "hungryPig",
    "Carta de Porco Faminto",
    "common",
    "Não era da china. Era do bairro.",
    "1000000006",
    { coins: 75, stats: { strength: 1, armor: 1 } },
  ),
  figurantOfBaalCult: makeCard(
    "figurantOfBaalCult",
    "Carta de Figurante do Culto de Baal",
    "common",
    "Nem sabia que era culto. Achava que era clube de leitura.",
    "1000000007",
    { coins: 75, stats: { technique: 2 } },
  ),
  figurantOfMobyDickCult: makeCard(
    "figurantOfMobyDickCult",
    "Carta de Figurante do Culto de Moby Dick",
    "common",
    "Estava aqui só pelo churrasco.",
    "1000000008",
    { coins: 75, stats: { resistance: 1, strength: 1, armor: 1 } },
  ),
  figurantOfDragonKingCult: makeCard(
    "figurantOfDragonKingCult",
    "Carta de Figurante do Culto do Rei Dragão",
    "common",
    "Acreditou que era cosplay. Foi tarde demais.",
    "1000000009",
    { coins: 100, stats: { resistance: 2, strength: 1, technique: 1 } },
  ),
  piupiu: makeCard(
    "piupiu",
    "Carta de Pinto",
    "rare",
    "Piu piu? Mais como... au au.",
    "2000000001",
    { coins: 200, hyperCoins: 1, stats: { strength: 3, luck: 2 } },
  ),
  jhowsimar: makeCard(
    "jhowsimar",
    "Carta de Jhowsimar",
    "rare",
    "O vigia mais assustador que já existiu. Menos que o porteiro da federal.",
    "2000000002",
    { coins: 200, hyperCoins: 1, stats: { resistance: 4, armor: 2 } },
  ),
  goat: makeCard(
    "goat",
    "Carta de Bode",
    "rare",
    "GOAT significa Greatest Of All Time. Mas ele era o pior.",
    "2000000003",
    { coins: 200, hyperCoins: 1, stats: { strength: 4, tenacity: 2 } },
  ),
  fischer: makeCard(
    "fischer",
    "Carta de Fischer",
    "rare",
    "Fischer Price? Não. Fischer Dor.",
    "2000000004",
    { coins: 200, hyperCoins: 1, stats: { technique: 4, luck: 2 } },
  ),
  crocodile: makeCard(
    "crocodile",
    "Carta de Crocodilo",
    "rare",
    "Crocodilo de bote? Não. Crocodilo de bote quente.",
    "2000000005",
    {
      coins: 250,
      hyperCoins: 2,
      stats: { strength: 3, resistance: 3, armor: 2 },
    },
  ),
  vandinhaFragment: makeCard(
    "vandinhaFragment",
    "Carta de Fragmento de Vandinha",
    "epic",
    "Só um pedaço e já é mais forte que você.",
    "3000000001",
    {
      coins: 500,
      hyperCoins: 5,
      stats: { resistance: 5, strength: 5, technique: 5 },
    },
  ),
  srGuaxinim: makeCard(
    "srGuaxinim",
    "Carta de Sr. Guaxinim",
    "epic",
    "Guaxinim com coroa. Elegante. Mortal. Com fome de lixo.",
    "3000000002",
    { coins: 500, hyperCoins: 5, stats: { luck: 8, tenacity: 4 } },
  ),
  duque: makeCard(
    "duque",
    "Carta de Cachorro de Natsuki",
    "epic",
    "O cachorro do Natsuki. Ele morde. Muito.",
    "3000000003",
    { coins: 500, hyperCoins: 5, stats: { strength: 8, resistance: 4 } },
  ),
  baiano: makeCard(
    "baiano",
    "Carta de Baiano",
    "epic",
    "Não é baiano de praia. É baiano de porrada.",
    "3000000004",
    {
      coins: 500,
      hyperCoins: 5,
      stats: { resistance: 6, strength: 6, armor: 4 },
    },
  ),
  elitCrocodile: makeCard(
    "elitCrocodile",
    "Carta de Crocodilo de Elite",
    "epic",
    "Crocodilo com diploma. Mais perigoso que um sem.",
    "3000000005",
    {
      coins: 600,
      hyperCoins: 6,
      stats: { strength: 7, tenacity: 3, armor: 6 },
    },
  ),
  deise: makeCard(
    "deise",
    "Carta de Deise",
    "boss",
    "Lich imortal. Imortal de verdade. Pelo menos até você chegar.",
    "4000000001",
    {
      coins: 1000,
      hyperCoins: 10,
      stats: { resistance: 10, technique: 10 },
      characterUnlock: "deise",
    },
  ),
  slimita: makeCard(
    "slimita",
    "Carta de Slimita",
    "boss",
    "A paquera mais perigosa do Jomasio. Cuidado com o olhar.",
    "4000000002",
    { coins: 1000, hyperCoins: 10, stats: { luck: 15, tenacity: 8 } },
  ),
  hungryKing: makeCard(
    "hungryKing",
    "Carta de Rei Faminto",
    "boss",
    "Rei de quê? De passar fome.",
    "4000000003",
    { coins: 1200, hyperCoins: 12, stats: { resistance: 15, strength: 8 } },
  ),
  neimito: makeCard(
    "neimito",
    "Carta de Neimito",
    "boss",
    "Mestre do calor. E de te derreter.",
    "4000000004",
    { coins: 1200, hyperCoins: 12, stats: { strength: 12, technique: 8 } },
  ),
  planetarySisters: makeCard(
    "planetarySisters",
    "Carta de Irmãs Planetárias",
    "boss",
    "Irmãs que se entendem. Que assustador.",
    "4000000005",
    {
      coins: 1200,
      hyperCoins: 12,
      stats: { resistance: 10, strength: 10, technique: 10 },
    },
  ),
  maugrelo: makeCard(
    "maugrelo",
    "Carta de Maugrelo",
    "boss",
    "Parece que gosta de apanhar. Estranho.",
    "4000000006",
    { coins: 1000, hyperCoins: 10, stats: { resistance: 20, armor: 10 } },
  ),
  maurao: makeCard(
    "maurao",
    "Carta de Maurão",
    "boss",
    "Salvou ele da loucura. Mas a loucura não salvou a gente.",
    "4000000007",
    { coins: 1200, hyperCoins: 12, stats: { strength: 15, tenacity: 8 } },
  ),
  spiritMotocycler: makeCard(
    "spiritMotocycler",
    "Carta de Motoqueiro Fantasma",
    "boss",
    "Juan Derson. O fantasma mais motorizado do cemitério.",
    "4000000008",
    { coins: 1200, hyperCoins: 12, stats: { strength: 12, luck: 10 } },
  ),
  tim: makeCard(
    "tim",
    "Carta de Tim",
    "boss",
    "Duas facas de sashimi e muita raiva. Não é um bom combo.",
    "4000000009",
    { coins: 1000, hyperCoins: 10, stats: { strength: 18 } },
  ),
  muyMacho: makeCard(
    "muyMacho",
    "Carta de Muy Macho",
    "boss",
    "O nome diz tudo. Macho demais pra morrer.",
    "4000000010",
    {
      coins: 1200,
      hyperCoins: 12,
      stats: { resistance: 15, strength: 12, armor: 5 },
    },
  ),
  lupita: makeCard(
    "lupita",
    "Carta de Lupita",
    "boss",
    "Lupita. Não confunda com a da novela.",
    "4000000011",
    { coins: 1000, hyperCoins: 10, stats: { technique: 18, luck: 8 } },
  ),
  leviathan: makeCard(
    "leviathan",
    "Carta do Leviathan",
    "boss",
    "Leviathan. A criatura lendária que habita as profundezas da Lagoa Grande.",
    "4000000012",
    {
      coins: 1200,
      hyperCoins: 12,
      stats: { resistance: 20, tenacity: 6, armor: 8 },
    },
  ),
  mobyDick: makeCard(
    "mobyDick",
    "Carta de Moby Dick",
    "boss",
    "A baleia mais famosa da literatura. E da porrada.",
    "4000000013",
    { coins: 1500, hyperCoins: 15, stats: { resistance: 25, strength: 10 } },
  ),
  ains: makeCard(
    "ains",
    "Carta de Ains",
    "boss",
    "OVERLORD. Mas caiu que nem um saco de batata.",
    "4000000014",
    { coins: 1500, hyperCoins: 15, stats: { technique: 20, strength: 10 } },
  ),
  baal: makeCard(
    "baal",
    "Carta de Baal",
    "legendary",
    "Deus do culto. Agora é carta no seu inventário. Humilhante.",
    "5000000001",
    {
      coins: 3000,
      hyperCoins: 30,
      stats: { resistance: 20, strength: 20, technique: 20 },
      characterUnlock: "baal",
    },
  ),
  madame: makeCard(
    "madame",
    "Carta de Madame",
    "legendary",
    "Aranha de caça. Caça você.",
    "5000000002",
    {
      coins: 3000,
      hyperCoins: 30,
      stats: { strength: 25, luck: 15 },
      characterUnlock: "madame",
    },
  ),
  yangKai: makeCard(
    "yangKai",
    "Carta de Yang Kai",
    "legendary",
    "Yang? Yin? Não. Só porrada.",
    "5000000003",
    {
      coins: 3000,
      hyperCoins: 30,
      stats: { resistance: 30, strength: 20 },
      characterUnlock: "yangKai",
    },
  ),
  dragonKing: makeCard(
    "dragonKing",
    "Carta de Rei Dragão",
    "legendary",
    "Rei dos dragões. E da sua coleção agora.",
    "5000000004",
    {
      coins: 3500,
      hyperCoins: 35,
      stats: { resistance: 25, strength: 25, armor: 10 },
      characterUnlock: "dragonKing",
    },
  ),
  technoblade: makeCard(
    "technoblade",
    "Carta de Technoblade",
    "legendary",
    "Technoblade never dies. Mas virou carta.",
    "5000000005",
    {
      coins: 3500,
      hyperCoins: 35,
      stats: { strength: 30, tenacity: 15 },
      characterUnlock: "technoblade",
    },
  ),
  trueVandinha: makeCard(
    "trueVandinha",
    "Carta de Verdadeira Vandinha",
    "legendary",
    "A real. A original. A que dói mais.",
    "5000000006",
    {
      coins: 4000,
      hyperCoins: 40,
      stats: { resistance: 30, strength: 25, technique: 25 },
      characterUnlock: "trueVandinha",
    },
  ),
};

export const CARD_CHANCE = 0.01;

export function rollCardDrop(npcType: string): NpcCard | null {
  const card = NPC_CARDS[npcType];
  if (!card) return null;
  if (Math.random() >= CARD_CHANCE) return null;
  return card;
}

/** Prefixo que `makeCard` usa para transformar `npcType` em id de item. */
const CARD_ITEM_PREFIX = "card_";

/**
 * Resolve o NPC dono de uma carta a partir do id do item.
 *
 * A UI genérica de inventário/drops só conhece o `ItemId`; é por aqui que ela
 * descobre que o item é uma carta e precisa da arte animada do NPC. Volta
 * `null` para qualquer item que não seja carta registrada — inclusive id de
 * save antigo cujo NPC saiu de `NPC_CARDS`.
 */
export function getCardNpcType(itemId: string): string | null {
  if (!itemId.startsWith(CARD_ITEM_PREFIX)) return null;
  const card = NPC_CARDS[itemId.slice(CARD_ITEM_PREFIX.length)];
  return card ? card.npcType : null;
}
