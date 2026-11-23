import type {
  LaricellAbilitiesApi,
  LaricellAbilityButton,
} from "@/hooks/battle/player/characters/laricell/types";

export type LaricellButtonSpec = {
  abilityId: string;
  label: string;
  state: LaricellAbilityButton;
};

/** Cores das bordas: gelo, ouro dos brincos, fumaça e sangue da linhagem. */

/**
 * Botões da Laricell, na ordem da issue #517 (A1 → A4). Na Forma Vampira, A1–A3
 * dão lugar à Mordida — é a regra "troca todas as habilidades anteriores" da
 * issue — e o botão da forma some (ela não se reativa enquanto dura). Nome,
 * descrição e cooldown vêm do registro em `data/characters/laricell/abilities.ts`
 * pelo `GenericAbilityButton`. O `label` curto é necessário porque não há arte
 * de fundo própria para esses botões.
 */
export function getLaricellButtons(
  laricell: LaricellAbilitiesApi,
): LaricellButtonSpec[] {
  if (laricell.visual.vampireActive) {
    return [
      {
        abilityId: "vampireBite",
        label: "MORDIDA",
        state: laricell.bite,
      },
    ];
  }
  return [
    {
      abilityId: "explodingEarrings",
      label: "BRINCOS",
      state: laricell.earrings,
    },
    {
      abilityId: "vampireForm",
      label: "VAMPIRO",
      state: laricell.vampireForm,
    },
  ];
}
