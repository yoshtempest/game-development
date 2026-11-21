import type { NAVBAR_OPTIONS } from "@/data/options/navbar";

/**
 * `equipment` não é mais um item da navbar: é um atalho interno (botão do
 * Status e tecla E) que abre a Mochila já na aba de equipamentos. Continua na
 * union porque o `SCREENS` precisa resolver essa rota.
 */
export type MenuScreen =
  | (typeof NAVBAR_OPTIONS)[number]["screen"]
  | "equipment";

export type NavScreen = "menu" | MenuScreen;

export type NavbarOption = {
  icon: string;
  label: string;
  screen: MenuScreen;
  confirmSfx?: SoundId;
};
