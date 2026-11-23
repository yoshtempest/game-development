import type {
  LaricellAbilitiesApi,
  LaricellAbilityButton,
} from "@/hooks/battle/player/characters/laricell/types";

export type LaricellButtonSpec = {
  abilityId: string;
  accent: string;
  state: LaricellAbilityButton;
};

/** Cores das bordas: gelo, ouro dos brincos, fumaça e sangue da linhagem. */
const LARICELL_ACCENTS = {
  iceWall: "#7dd3fc",
  explodingEarrings: "#facc15",
  smokeBomb: "#a1a1aa",
  vampireForm: "#b91c1c",
  vampireBite: "#dc2626",
} as const;

/**
 * Botões da Laricell, na ordem da issue #517 (A1 → A4). Na Forma Vampira, A1–A3
 * dão lugar à Mordida — é a regra "troca todas as habilidades anteriores" da
 * issue — e o botão da forma some (ela não se reativa enquanto dura). Nome,
 * descrição e cooldown vêm do registro em `data/characters/laricell/abilities.ts`
 * pelo `GenericAbilityButton`.
 */
export function getLaricellButtons(
  laricell: LaricellAbilitiesApi,
): LaricellButtonSpec[] {
  if (laricell.visual.vampireActive) {
    return [
      {
        abilityId: "vampireBite",
        accent: LARICELL_ACCENTS.vampireBite,
        state: laricell.bite,
      },
    ];
  }
  return [
    {
      abilityId: "iceWall",
      accent: LARICELL_ACCENTS.iceWall,
      state: laricell.iceWall,
    },
    {
      abilityId: "explodingEarrings",
      accent: LARICELL_ACCENTS.explodingEarrings,
      state: laricell.earrings,
    },
    {
      abilityId: "smokeBomb",
      accent: LARICELL_ACCENTS.smokeBomb,
      state: laricell.smokeBomb,
    },
    {
      abilityId: "vampireForm",
      accent: LARICELL_ACCENTS.vampireForm,
      state: laricell.vampireForm,
    },
  ];
}
