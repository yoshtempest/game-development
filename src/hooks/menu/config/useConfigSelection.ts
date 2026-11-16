import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useGameControls } from "@/contexts/GameControlsContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useAudio } from "@/hooks/audio/useAudio";

import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import { useSettings } from "@/hooks/settings/useSetting";
import { useUpdate } from "@/contexts/UpdateContext";
import { usePWA } from "@/contexts/PWAContext";
import type { ConfigTab } from "@/data/config/tabs";
import { CONFIG_TABS, CONFIG_TAB_COUNT } from "@/data/config/tabs";
import { useLatestRef } from "@/hooks/useLatestRef";
import {
  DIFFICULTY,
  COLUMN_COUNT,
  BATTLE_COUNT,
  CONTENT_COUNT,
  getColumnMaxIndex,
} from "./configConstants";
import { useConfigActions } from "./useConfigActions";
import { DIALOGUE_SPEED_LIST, type DialogueSpeed } from "@/utils/settings";

/**
 * Linhas da aba em lista (batalha/conteúdo), ou `null` na aba "geral", que é
 * uma grade de colunas. As duas abas em lista compartilham a mesma navegação:
 * ↑/↓ percorrem as linhas, ← volta para as abas.
 */
function getListRowCount(tab: ConfigTab): number | null {
  if (tab === "batalha") return BATTLE_COUNT;
  if (tab === "conteudo") return CONTENT_COUNT;
  return null;
}

export function useConfigSelection(
  isActive: boolean,
  onConfirm?: () => void,
  onContentConfirm?: (index: number) => void,
) {
  const navigate = useNavigate();
  const { pushControls } = useGameControls();

  const { setDifficulty, difficulty: activeDifficulty, player } = usePlayer();
  const { sfxVolume, setSfxVolume, bgmVolume, setBgmVolume } = useAudio();
  const {
    setDialogueSpeed,
    dialogueSpeed,
    showQuestIndicator,
    setShowQuestIndicator,
    showComboAction,
    setShowComboAction,
    showHighlight,
    setShowHighlight,
    showAbilityIntro,
    setShowAbilityIntro,
    sharedXp,
    setSharedXp,
    language,
    setLanguage,
  } = useSettings();
  const { checkForUpdate } = useUpdate();
  const {
    install,
    isInstalled,
    method,
    setShowInstalledMessage,
    setShowInstructions,
  } = usePWA();
  const { playMove, playSelect, playClose } = useMenuSFX();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedColumn, setSelectedColumn] = useState(0);

  const [activeTab, setActiveTab] = useState<ConfigTab>("geral");
  const [isOnTab, setIsOnTab] = useState(true);

  // menu | tutorial
  const [screen, setScreen] = useState<"menu" | "tutorial">("menu");

  const selectedIndexRef = useLatestRef(selectedIndex);
  const selectedColumnRef = useLatestRef(selectedColumn);
  const screenRef = useLatestRef(screen);
  const isOnTabRef = useLatestRef(isOnTab);
  const activeTabRef = useLatestRef(activeTab);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
    selectedColumnRef.current = selectedColumn;
    screenRef.current = screen;
    isOnTabRef.current = isOnTab;
    activeTabRef.current = activeTab;
  }, [
    selectedIndex,
    selectedColumn,
    screen,
    isOnTab,
    activeTab,
    selectedIndexRef,
    selectedColumnRef,
    screenRef,
    isOnTabRef,
    activeTabRef,
  ]);

  const playMoveRef = useLatestRef(playMove);
  const playSelectRef = useLatestRef(playSelect);
  const playCloseRef = useLatestRef(playClose);
  const pushControlsRef = useLatestRef(pushControls);
  const setDifficultyRef = useLatestRef(setDifficulty);
  const setSfxVolumeRef = useLatestRef(setSfxVolume);
  const setBgmVolumeRef = useLatestRef(setBgmVolume);
  const setDialogueSpeedRef = useLatestRef(setDialogueSpeed);
  const setShowQuestIndicatorRef = useLatestRef(setShowQuestIndicator);
  const setShowComboActionRef = useLatestRef(setShowComboAction);
  const setShowHighlightRef = useLatestRef(setShowHighlight);
  const setShowAbilityIntroRef = useLatestRef(setShowAbilityIntro);
  const setSharedXpRef = useLatestRef(setSharedXp);
  const setLanguageRef = useLatestRef(setLanguage);
  const checkForUpdateRef = useLatestRef(checkForUpdate);
  const installRef = useLatestRef(install);
  const isInstalledRef = useLatestRef(isInstalled);
  const methodRef = useLatestRef(method);
  const setShowInstalledMessageRef = useLatestRef(setShowInstalledMessage);
  const setShowInstructionsRef = useLatestRef(setShowInstructions);
  const onConfirmRef = useLatestRef(onConfirm);
  const onContentConfirmRef = useLatestRef(onContentConfirm);
  const navigateRef = useLatestRef(navigate);

  const modeRef = useLatestRef(player.mode);
  const activeDifficultyRef = useLatestRef(activeDifficulty);
  const activeSpeedRef = useLatestRef(dialogueSpeed);

  /** Cicla a dificuldade ativa (usado pelos triângulos e pelas setas do card). */
  const cycleDifficulty = useCallback(
    (dir: 1 | -1) => {
      const current = DIFFICULTY.indexOf(activeDifficultyRef.current);
      const next = DIFFICULTY[
        (current + dir + DIFFICULTY.length) % DIFFICULTY.length
      ] as NpcDifficulty;
      setDifficultyRef.current(next);
      playMoveRef.current();
    },
    [activeDifficultyRef, setDifficultyRef, playMoveRef],
  );

  /** Cicla a velocidade de diálogo ativa (triângulos e setas do card). */
  const cycleDialogueSpeed = useCallback(
    (dir: 1 | -1) => {
      const current = DIALOGUE_SPEED_LIST.indexOf(activeSpeedRef.current);
      const next = DIALOGUE_SPEED_LIST[
        (current + dir + DIALOGUE_SPEED_LIST.length) %
          DIALOGUE_SPEED_LIST.length
      ] as DialogueSpeed;
      setDialogueSpeedRef.current(next);
      playMoveRef.current();
    },
    [activeSpeedRef, setDialogueSpeedRef, playMoveRef],
  );

  const { handleConfirm, handleCancel } = useConfigActions({
    showQuestIndicator,
    sharedXp,
    showComboAction,
    showHighlight,
    showAbilityIntro,
    language,
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
    isInstalledRef,
    methodRef,
    installRef,
    setShowInstalledMessageRef,
    setShowInstructionsRef,
    setShowComboActionRef,
    setShowHighlightRef,
    setShowAbilityIntroRef,
    setLanguageRef,
    navigateRef,
    onConfirmRef,
    onContentConfirmRef,
    setScreen,
  });

  useEffect(() => {
    if (!isActive) return;

    const controls = {
      onRight: () => {
        if (screenRef.current !== "menu") return;
        playMoveRef.current();

        if (isOnTabRef.current) {
          setActiveTab((prev) => {
            const currentIdx = CONFIG_TABS.indexOf(prev);
            return CONFIG_TABS[(currentIdx + 1) % CONFIG_TAB_COUNT]!;
          });
          return;
        }

        if (getListRowCount(activeTabRef.current) !== null) return;

        setSelectedColumn((prev) => (prev + 1) % COLUMN_COUNT);
        setSelectedIndex(0);
      },

      onLeft: () => {
        if (screenRef.current !== "menu") return;
        playMoveRef.current();

        if (isOnTabRef.current) {
          setActiveTab((prev) => {
            const currentIdx = CONFIG_TABS.indexOf(prev);
            return CONFIG_TABS[
              (currentIdx - 1 + CONFIG_TAB_COUNT) % CONFIG_TAB_COUNT
            ]!;
          });
          return;
        }

        if (getListRowCount(activeTabRef.current) !== null) {
          setIsOnTab(true);
          return;
        }

        if (selectedColumnRef.current === 0) {
          setIsOnTab(true);
          return;
        }

        setSelectedColumn((prev) => prev - 1);
        setSelectedIndex(0);
      },

      onDown: () => {
        if (screenRef.current !== "menu") return;
        playMoveRef.current();

        if (isOnTabRef.current) {
          setIsOnTab(false);
          setSelectedColumn(0);
          setSelectedIndex(0);
          return;
        }

        const col = selectedColumnRef.current;

        const listRows = getListRowCount(activeTabRef.current);
        if (listRows !== null) {
          setSelectedIndex((prev) => (prev + 1) % listRows);
          return;
        }

        // Coluna 0 (tab geral) = card único de dificuldade: setas ciclam.
        if (col === 0) {
          cycleDifficulty(1);
          return;
        }

        // Coluna 1 (tab geral) = card único de velocidade de diálogo: setas ciclam.
        if (col === 1) {
          cycleDialogueSpeed(1);
          return;
        }

        if (col === 3) {
          setSfxVolumeRef.current(Math.min(sfxVolume + 10, 100));
          return;
        }

        if (col === 4) {
          setBgmVolumeRef.current(Math.min(bgmVolume + 10, 100));
          return;
        }

        const maxIndex = getColumnMaxIndex(col);
        setSelectedIndex((prev) => (prev + 1) % maxIndex);
      },

      onUp: () => {
        if (screenRef.current !== "menu") return;
        playMoveRef.current();

        if (isOnTabRef.current) return;

        if (getListRowCount(activeTabRef.current) !== null) {
          if (selectedIndexRef.current === 0) {
            setIsOnTab(true);
            return;
          }
          setSelectedIndex((prev) => prev - 1);
          return;
        }

        const col = selectedColumnRef.current;

        // Coluna 0 (tab geral) = card único de dificuldade: setas ciclam.
        if (col === 0) {
          cycleDifficulty(-1);
          return;
        }

        // Coluna 1 (tab geral) = card único de velocidade de diálogo: setas ciclam.
        if (col === 1) {
          cycleDialogueSpeed(-1);
          return;
        }

        if (col === 3) {
          setSfxVolumeRef.current(Math.max(sfxVolume - 10, 0));
          return;
        }

        if (col === 4) {
          setBgmVolumeRef.current(Math.max(bgmVolume - 10, 0));
          return;
        }

        if (selectedIndexRef.current === 0) {
          setIsOnTab(true);
          return;
        }

        setSelectedIndex((prev) => prev - 1);
      },

      onConfirm: handleConfirm,

      onCancel: handleCancel,

      blockGlobalOpen: true,
    };

    const remove = pushControlsRef.current(controls);

    return () => remove();
  }, [
    isActive,
    sfxVolume,
    bgmVolume,
    handleConfirm,
    handleCancel,
    setShowQuestIndicator,
    setShowComboAction,
    setShowHighlight,
    setSharedXp,
    checkForUpdateRef,
    installRef,
    isInstalledRef,
    modeRef,
    navigateRef,
    onConfirmRef,
    playCloseRef,
    playMoveRef,
    playSelectRef,
    pushControlsRef,
    setBgmVolumeRef,
    setDialogueSpeedRef,
    setDifficultyRef,
    setSfxVolumeRef,
    setSharedXpRef,
    setShowComboActionRef,
    setShowHighlightRef,
    setShowInstalledMessageRef,
    setShowQuestIndicatorRef,
    activeTabRef,
    isOnTabRef,
    screenRef,
    selectedColumnRef,
    selectedIndexRef,
    cycleDifficulty,
    cycleDialogueSpeed,
  ]);

  return {
    difficulty: DIFFICULTY,
    selectedIndex,
    selectedColumn,
    screen,
    showQuestIndicator,
    showComboAction,
    showHighlight,
    showAbilityIntro,
    sharedXp,
    language,
    activeTab,
    isOnTab,
    cycleDifficulty,
    cycleDialogueSpeed,
  };
}
