import type { NAVBAR_OPTIONS } from "@/data/options/navbar";

/**
 * `equipment` e `status` não são itens da navbar: são atalhos internos.
 * - `equipment`: botão da Mochila/Status e tecla E;
 * - `status`: entrada direta nos detalhes do personagem em uso.
 *
 * Ambos continuam na union porque o `SCREENS` precisa resolver essas rotas.
 */
export type MenuScreen =
  | (typeof NAVBAR_OPTIONS)[number]["screen"]
  | "equipment"
  | "status";

export type NavScreen = "menu" | MenuScreen;

export type NavbarOption = {
  icon: string;
  label: string;
  screen: MenuScreen;
  confirmSfx?: SoundId;
};
