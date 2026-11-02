import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { ReactNode } from "react";

import type { GameControlLayer } from "@/utils/types/player/controls";

import { usePlayer } from "@/contexts/PlayerContext";
import { useNavbar } from "@/contexts/NavbarContext";
import { useBattleNavbar } from "@/contexts/BattleNavbarContext";

import { shouldConsumeInput } from "@/gameRules/movement/input";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useGameKeyboard } from "@/hooks/game/gameKeyboard/useGameKeyboard";

type Props = {
  children: ReactNode;
};

type ControlsContextType = {
  pushControls: (controls: GameControlLayer) => () => void;
  clearControls: () => void;
  closeAllMenus: () => void;
  activeControls: GameControlLayer;
};

const GameControlsContext = createContext<ControlsContextType | null>(null);

export function GameControlsProvider({ children }: Props) {
  const [stack, setStack] = useState<GameControlLayer[]>([]);

  const { player, restoreMode } = usePlayer();

  const { openNavbar, closeNavbar, openScreen, isNavOpen, screen } =
    useNavbar();

  const { isBattleNavOpen, toggleBattleNavbar } = useBattleNavbar();

  // REFS

  const restoreModeRef = useLatestRef(restoreMode);

  const playerModeRef = useLatestRef(player.mode);

  const closeNavbarRef = useLatestRef(closeNavbar);

  const isNavOpenRef = useLatestRef(isNavOpen);

  const screenRef = useLatestRef(screen);

  const isBattleNavOpenRef = useLatestRef(isBattleNavOpen);

  // CONTROLS STACK

  const pushControls = useCallback((controls: GameControlLayer) => {
    setStack((prev) => [...prev, controls]);

    return () => {
      setStack((prev) => prev.filter((layer) => layer !== controls));
    };
  }, []);

  const clearControls = useCallback(() => {
    setStack([]);
  }, []);

  const closeAllMenus = useCallback(() => {
    closeNavbarRef.current();
    restoreModeRef.current();
  }, [closeNavbarRef, restoreModeRef]);

  // ACTIVE CONTROLS

  const activeControls = useMemo((): GameControlLayer => {
    const top = stack[stack.length - 1];

    const findRelease = (
      getter: (layer: GameControlLayer) => (() => void) | undefined,
    ) => {
      for (let i = stack.length - 1; i >= 0; i--) {
        const layer = stack[i];
        if (!layer) continue;
        const fn = getter(layer);
        if (fn) return fn;
      }
      return undefined;
    };

    return {
      onUp: () => {
        for (let i = stack.length - 1; i >= 0; i--) {
          const handled = stack[i]?.onUp?.();

          if (shouldConsumeInput(handled)) {
            break;
          }
        }
      },

      onDown: () => {
        for (let i = stack.length - 1; i >= 0; i--) {
          const handled = stack[i]?.onDown?.();

          if (shouldConsumeInput(handled)) {
            break;
          }
        }
      },

      onLeft: () => {
        for (let i = stack.length - 1; i >= 0; i--) {
          const handled = stack[i]?.onLeft?.();

          if (shouldConsumeInput(handled)) {
            break;
          }
        }
      },

      onRight: () => {
        for (let i = stack.length - 1; i >= 0; i--) {
          const handled = stack[i]?.onRight?.();

          if (shouldConsumeInput(handled)) {
            break;
          }
        }
      },

      onConfirm: () => {
        for (let i = stack.length - 1; i >= 0; i--) {
          const handled = stack[i]?.onConfirm?.();

          if (shouldConsumeInput(handled)) {
            break;
          }
        }
      },

      onCancel: () => {
        for (let i = stack.length - 1; i >= 0; i--) {
          const handled = stack[i]?.onCancel?.();

          if (shouldConsumeInput(handled)) {
            break;
          }
        }
      },

      onConfirmRelease: findRelease((layer) => layer.onConfirmRelease),

      onCancelRelease: findRelease((layer) => layer.onCancelRelease),

      onUpRelease: findRelease((layer) => layer.onUpRelease),

      onDownRelease: findRelease((layer) => layer.onDownRelease),

      onLeftRelease: findRelease((layer) => layer.onLeftRelease),

      onRightRelease: findRelease((layer) => layer.onRightRelease),

      onOpen: top?.onOpen,

      blockGlobalOpen: top?.blockGlobalOpen ?? false,
    };
  }, [stack]);

  // KEYBOARD

  const activeControlsRef = useLatestRef(activeControls);

  useGameKeyboard({
    controlsRef: activeControlsRef,
    playerModeRef,
    isNavOpenRef,
    screenRef,
    isBattleNavOpenRef,

    openNavbar,
    closeAllMenus,

    closeNavbar,
    openScreen,
    toggleBattleNavbar,
  });

  // PROVIDER

  const value = useMemo(
    () => ({
      pushControls,
      clearControls,
      closeAllMenus,
      activeControls,
    }),
    [pushControls, clearControls, closeAllMenus, activeControls],
  );

  return (
    <GameControlsContext.Provider value={value}>
      {children}
    </GameControlsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGameControls() {
  const ctx = useContext(GameControlsContext);

  if (!ctx) {
    throw new Error("useGameControls need provider");
  }

  return ctx;
}
