import type { BATTLE_NAVBAR_OPTIONS } from "@/data/options/battleNavbar";


export type BattleNavScreen = (typeof BATTLE_NAVBAR_OPTIONS)[number]["screen"];

export type BattleNavLocation = "menu" | BattleNavScreen;

export type BattleNavbarOption = {
  icon: string;
  label: string;
  screen: BattleNavScreen;
  confirmSfx?: SoundId;
};
