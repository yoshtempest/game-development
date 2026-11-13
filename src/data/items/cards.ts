import { createCards } from "@/utils/items/createItem";
import { NPC_CARDS, CLASS_DATA } from "@/data/npc";
import { npcPath } from "@/utils/paths";

/**
 * Arte da carta: o rosto do NPC (issue #497).
 *
 * Nem todo NPC tem `face.svg`; quem renderiza a carta deve cair em
 * `cardFallbackImage` quando o rosto não carregar.
 */
export function cardImage(npcType: string): string {
  return npcPath(`/${npcType}/face.svg`);
}

/**
 * Arte antiga da carta (sprite de lado), usada quando o NPC ainda não tem
 * `face.svg` — todo NPC lutável tem `right.svg`, então a carta nunca fica
 * sem imagem.
 */
export function cardFallbackImage(npcType: string): string {
  return npcPath(`/${npcType}/right.svg`);
}

function cardDescription(card: (typeof NPC_CARDS)[string]): string {
  const classLabel = CLASS_DATA[card.npcClass].label;
  const lines = [
    card.description,
    "",
    `Classe: ${classLabel}`,
    `ATK: ${card.attack}  DEF: ${card.defense}`,
    `Cod: ${card.code}`,
  ];

  const reward = card.reward;
  const rewardLines: string[] = [];

  if (reward.coins) rewardLines.push(`Kwanzas: +${reward.coins}`);
  if (reward.hyperCoins) rewardLines.push(`HyperCoins: +${reward.hyperCoins}`);

  if (reward.stats) {
    const statNames: Record<string, string> = {
      strength: "Força",
      technique: "Técnica",
      spirit: "Espírito",
      resistance: "Resistência",
      tenacity: "Tenacidade",
      luck: "Sorte",
      armor: "Armadura",
    };
    for (const [key, val] of Object.entries(reward.stats)) {
      if (val) rewardLines.push(`${statNames[key] ?? key}: +${val}`);
    }
  }

  if (reward.characterUnlock) {
    rewardLines.push(`Desbloqueio: ${reward.characterUnlock}`);
  }

  if (rewardLines.length > 0) {
    lines.push("", "Recompensas:", ...rewardLines);
  }

  return lines.join("\n");
}

const CARD_ITEMS = Object.fromEntries(
  Object.values(NPC_CARDS).map((card) => [
    card.id,
    {
      image: cardImage(card.npcType),
      name: card.name,
      description: cardDescription(card),
      type: "card" as const,
    },
  ]),
);

export const CARDS = createCards(CARD_ITEMS);
