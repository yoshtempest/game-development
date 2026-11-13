import { navbarIconPath } from "@/utils/paths";

/**
 * Cura extra, em HP por segundo, enquanto o jogador está sentado na
 * exploração. Soma-se à regeneração normal em vez de substituí-la: sentar
 * nunca pode curar menos do que ficar em pé.
 */
export const SITTING_HEAL_PER_SECOND = 1;

export type ExploreEmoteOption = {
  id: ExploreEmote;
  label: string;
  description: string;
  icon: string;
};

/**
 * Animações listadas no menu "Animações", na ordem exibida. O sprite de cada
 * uma mora em `player/<personagem>/movement/<id>.svg`; personagem sem o
 * arquivo cai no sprite parado (ver `Entities/Player`).
 */
export const EXPLORE_EMOTES: readonly ExploreEmoteOption[] = [
  {
    id: "sitting",
    label: "Sentar",
    description: `Fica sentado e recupera +${SITTING_HEAL_PER_SECOND} de vida por segundo. Andar levanta.`,
    icon: navbarIconPath("sitting.svg"),
  },
];
