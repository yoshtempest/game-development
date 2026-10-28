import type { ElementType } from "@/utils/types/battle/element";

/**
 * Tipagens elementais de cada personagem.
 *
 * Fonte única e literal: a lista é a tipagem do personagem. Alterar a tipagem
 * de um personagem reflete aqui e, por consequência, em toda a batalha.
 *
 * Não há progressão elemental: a lista vale do nível 1 ao fim do jogo.
 */
export const CHARACTER_ELEMENT_TYPES = {
  marshadow: ["Normalis", "Darkus"],
  drika: ["Normalis", "Haos"],
  yvel: ["Normalis"],
  samurion: ["Normalis", "Subterra"],
  srGuaxinim: ["Normalis", "Darkus", "Umbra"],
  yra: ["Normalis", "Aquos", "Umbra"],
  babidi: ["Normalis", "Metallum", "Psychicus"],
  natsuki: ["Normalis", "Haos", "Darkus"],
  laricell: ["Normalis", "Metallum", "Electricus"],
  camyKaze: ["Normalis"],
  ematron: ["Normalis", "Ventus", "Electricus"],
  levi: ["Normalis", "Draco"],
} as const satisfies Record<CharacterId, readonly ElementType[]>;

/** Tipagem elemental do personagem — o que o funil de dano e a UI leem. */
export function getCharacterElementTypes(
  character: CharacterId,
): readonly ElementType[] {
  return CHARACTER_ELEMENT_TYPES[character];
}
