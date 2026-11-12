import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { BattleNavLocation } from "@/utils/types/player/battleNavbar";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useToggle } from "@/hooks/useToggle";
import { usePlayer } from "@/contexts/PlayerContext";

type BattleNavbarContextType = {
  isBattleNavOpen: boolean;
  isClosing: boolean;

  location: BattleNavLocation;
  setLocation: (location: BattleNavLocation) => void;

  openBattleNavbar: () => void;
  closeBattleNavbar: () => void;
  toggleBattleNavbar: () => void;
  finishClose: () => void;

  resetBattleNavbar: () => void;

  /**
   * Pausa de seletor em batalha (ex.: o arsenal do Unlimited Blade Works do
   * Yvel). Congela a batalha exatamente como o menu — modo "menu" no player e
   * `isMenuOpen` no `useMenuPause` —, mas sem abrir o navbar: quem abriu
   * desenha a própria UI por cima.
   */
  isSelectorPauseOpen: boolean;
  openSelectorPause: () => void;
  closeSelectorPause: () => void;
};

const BattleNavbarContext = createContext<BattleNavbarContextType | null>(null);

export function BattleNavbarProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<BattleNavLocation>("menu");
  const {
    isOpen: isBattleNavOpen,
    open: openToggle,
    close: closeToggle,
  } = useToggle();
  const [isClosing, setIsClosing] = useState(false);
  const [isSelectorPauseOpen, setIsSelectorPauseOpen] = useState(false);

  const { player, setMode, restoreMode } = usePlayer();

  const isSelectorPauseOpenRef = useLatestRef(isSelectorPauseOpen);
  const locationRef = useLatestRef(location);
  const isBattleNavOpenRef = useLatestRef(isBattleNavOpen);
  const isClosingRef = useLatestRef(isClosing);
  const playerModeRef = useLatestRef(player.mode);

  const setLocation = useCallback((l: BattleNavLocation) => {
    setLocationState(l);
  }, []);

  // Pausa a batalha: modo "menu" congela gravidade/animações e o tempo de batalha.
  const openBattleNavbar = useCallback(() => {
    if (playerModeRef.current !== "battle") return;
    setIsClosing(false);
    setMode("menu");
    openToggle();
  }, [openToggle, playerModeRef, setMode]);

  const closeBattleNavbar = useCallback(() => {
    if (!isBattleNavOpenRef.current && !isClosingRef.current) return;
    const shouldAnimate = locationRef.current === "menu";
    setLocationState("menu");
    if (shouldAnimate) {
      if (!isClosingRef.current) setIsClosing(true);
      return;
    }
    closeToggle();
    restoreMode();
  }, [closeToggle, isBattleNavOpenRef, locationRef, isClosingRef, restoreMode]);

  const finishClose = useCallback(() => {
    if (!isClosingRef.current) return;
    setIsClosing(false);
    closeToggle();
    restoreMode();
  }, [closeToggle, isClosingRef, restoreMode]);

  const toggleBattleNavbar = useCallback(() => {
    if (isBattleNavOpenRef.current || isClosingRef.current) {
      closeBattleNavbar();
      return;
    }
    openBattleNavbar();
  }, [closeBattleNavbar, isBattleNavOpenRef, isClosingRef, openBattleNavbar]);

  /**
   * Abre a pausa de seletor. Só entra em batalha e só uma vez: abrir de novo
   * sobrescreveria o modo salvo pelo `setMode` com o próprio "menu", e o
   * `restoreMode` do fechamento devolveria o player ao modo errado.
   */
  const openSelectorPause = useCallback(() => {
    if (isSelectorPauseOpenRef.current) return;
    if (playerModeRef.current !== "battle") return;
    setMode("menu");
    setIsSelectorPauseOpen(true);
  }, [isSelectorPauseOpenRef, playerModeRef, setMode]);

  /** Fecha a pausa de seletor; idempotente para o cleanup de unmount. */
  const closeSelectorPause = useCallback(() => {
    if (!isSelectorPauseOpenRef.current) return;
    setIsSelectorPauseOpen(false);
    restoreMode();
  }, [isSelectorPauseOpenRef, restoreMode]);

  // Fecha sem restaurar modo (usado ao montar/desmontar a cena de batalha).
  const resetBattleNavbar = useCallback(() => {
    setIsClosing(false);
    setLocationState("menu");
    closeToggle();
  }, [closeToggle]);

  const value = useMemo(
    () => ({
      isBattleNavOpen,
      isClosing,
      location,
      setLocation,
      openBattleNavbar,
      closeBattleNavbar,
      toggleBattleNavbar,
      finishClose,
      resetBattleNavbar,
      isSelectorPauseOpen,
      openSelectorPause,
      closeSelectorPause,
    }),
    [
      isBattleNavOpen,
      isClosing,
      location,
      setLocation,
      openBattleNavbar,
      closeBattleNavbar,
      toggleBattleNavbar,
      finishClose,
      resetBattleNavbar,
      isSelectorPauseOpen,
      openSelectorPause,
      closeSelectorPause,
    ],
  );

  return (
    <BattleNavbarContext.Provider value={value}>
      {children}
    </BattleNavbarContext.Provider>
  );
}

const DEFAULT_BATTLE_NAVBAR: BattleNavbarContextType = {
  isBattleNavOpen: false,
  isClosing: false,
  location: "menu",
  setLocation: () => {},
  openBattleNavbar: () => {},
  closeBattleNavbar: () => {},
  toggleBattleNavbar: () => {},
  finishClose: () => {},
  resetBattleNavbar: () => {},
  isSelectorPauseOpen: false,
  openSelectorPause: () => {},
  closeSelectorPause: () => {},
};

// eslint-disable-next-line react-refresh/only-export-components
export function useBattleNavbar(): BattleNavbarContextType {
  const context = useContext(BattleNavbarContext);
  return context ?? DEFAULT_BATTLE_NAVBAR;
}
