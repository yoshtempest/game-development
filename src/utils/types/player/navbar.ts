import type { NAVBAR_OPTIONS } from "@/data/options/navbar";

export type MenuScreen = (typeof NAVBAR_OPTIONS)[number]["screen"];

export type NavScreen = "menu" | MenuScreen;

export type NavbarOption = {
  icon: string;
  label: string;
  screen: MenuScreen;
  confirmSfx?: SoundId;
};
