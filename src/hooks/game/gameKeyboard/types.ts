import type { RefObject } from "react";

import type { GameControlLayer } from "@/utils/types/player/controls";
import type { NavScreen } from "@/utils/types/player/navbar";

export type GameKeyboardOptions = {
  controlsRef: RefObject<GameControlLayer>;
  playerModeRef: RefObject<string>;
  isNavOpenRef: RefObject<boolean>;
  screenRef: RefObject<string | undefined>;
  isBattleNavOpenRef: RefObject<boolean>;

  openNavbar: () => void;
  closeAllMenus: () => void;

  closeNavbar: () => void;
  openScreen: (screen: Exclude<NavScreen, "menu">) => void;
  toggleBattleNavbar: () => void;
};
