import { useCallback, type RefObject } from "react";
import type { ConfigTab } from "@/data/config/tabs";

interface UseConfigActionsParams {
  showQuestIndicator: boolean;
  sharedXp: boolean;
  showComboAction: boolean;
  showHighlight: boolean;
  showAbilityIntro: boolean;

  screenRef: RefObject<"menu" | "tutorial">;
  isOnTabRef: RefObject<boolean>;
  activeTabRef: RefObject<ConfigTab>;
  selectedColumnRef: RefObject<number>;
  selectedIndexRef: RefObject<number>;
  modeRef: RefObject<string>;
  playSelectRef: RefObject<() => void>;
  playCloseRef: RefObject<() => void>;
  setShowQuestIndicatorRef: RefObject<(v: boolean) => void>;
  setSharedXpRef: RefObject<(v: boolean) => void>;
  checkForUpdateRef: RefObject<() => void>;
  toggleNotificationsRef: RefObject<() => void>;
  isInstalledRef: RefObject<boolean>;
  methodRef: RefObject<string>;
  installRef: RefObject<() => Promise<boolean>>;
  setShowInstalledMessageRef: RefObject<(v: boolean) => void>;
  setShowInstructionsRef: RefObject<(v: boolean) => void>;
  setShowComboActionRef: RefObject<(v: boolean) => void>;
  setShowHighlightRef: RefObject<(v: boolean) => void>;
  setShowAbilityIntroRef: RefObject<(v: boolean) => void>;
  navigateRef: RefObject<(path: string) => void>;
  onConfirmRef: RefObject<(() => void) | undefined>;
  setScreen: (s: "menu" | "tutorial") => void;
}

export function useConfigActions({
  showQuestIndicator,
  sharedXp,
  showComboAction,
  showHighlight,
  showAbilityIntro,
  screenRef,
  isOnTabRef,
  activeTabRef,
  selectedColumnRef,
  selectedIndexRef,
  modeRef,
  playSelectRef,
  playCloseRef,
  setShowQuestIndicatorRef,
  setSharedXpRef,
  checkForUpdateRef,
  toggleNotificationsRef,
  isInstalledRef,
  methodRef,
  installRef,
  setShowInstalledMessageRef,
  setShowInstructionsRef,
  setShowComboActionRef,
  setShowHighlightRef,
  setShowAbilityIntroRef,
  navigateRef,
  onConfirmRef,
  setScreen,
}: UseConfigActionsParams) {
  const handleConfirm = useCallback((): boolean => {
    if (screenRef.current !== "menu") return true;
    if (isOnTabRef.current) return true;

    playSelectRef.current();

    const col = selectedColumnRef.current;
    const idx = selectedIndexRef.current;

    if (activeTabRef.current === "geral") {
      if (col === 2) {
        if (idx === 0) {
          setShowQuestIndicatorRef.current(!showQuestIndicator);
        }

        if (idx === 1) {
          setSharedXpRef.current(!sharedXp);
        }

        if (idx === 2) {
          setScreen("tutorial");
        }

        if (idx === 3) {
          checkForUpdateRef.current();
        }

        if (idx === 4) {
          if (isInstalledRef.current) {
            setShowInstalledMessageRef.current(true);
          } else if (methodRef.current === "native") {
            void installRef.current();
          } else {
            setShowInstructionsRef.current(true);
          }
        }

        if (idx === 5) {
          toggleNotificationsRef.current();
        }
      }
    }

    if (activeTabRef.current === "batalha") {
      if (idx === 0) {
        setShowComboActionRef.current(!showComboAction);
      }

      if (idx === 1) {
        setShowHighlightRef.current(!showHighlight);
      }

      if (idx === 2) {
        setShowAbilityIntroRef.current(!showAbilityIntro);
      }

      if (idx === 3) {
        navigateRef.current("/training");
      }
    }

    onConfirmRef.current?.();

    return true;
  }, [
    showQuestIndicator,
    sharedXp,
    showComboAction,
    showHighlight,
    showAbilityIntro,
    screenRef,
    isOnTabRef,
    activeTabRef,
    selectedColumnRef,
    selectedIndexRef,
    playSelectRef,
    setShowQuestIndicatorRef,
    setSharedXpRef,
    setScreen,
    checkForUpdateRef,
    toggleNotificationsRef,
    isInstalledRef,
    methodRef,
    installRef,
    setShowInstalledMessageRef,
    setShowInstructionsRef,
    setShowComboActionRef,
    setShowHighlightRef,
    setShowAbilityIntroRef,
    navigateRef,
    onConfirmRef,
  ]);

  const handleCancel = useCallback((): boolean => {
    if (modeRef.current === "battle") return true;
    playCloseRef.current();
    if (screenRef.current === "tutorial") {
      setScreen("menu");
      return true;
    }

    return false;
  }, [modeRef, playCloseRef, screenRef, setScreen]);

  return { handleConfirm, handleCancel };
}
