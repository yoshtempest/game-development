import { useCallback, useMemo } from "react";
import type { DialogueSpeed } from "@/utils/settings";
import { SPEED_MAP } from "@/data/settings/dialogueSpeed";
import {
  DIALOGUE_SPEED_KEY,
  SHOW_QUEST_INDICATOR_KEY,
  SHOW_COMBO_ACTION_KEY,
  SHOW_HIGHLIGHT_KEY,
  SHOW_ABILITY_INTRO_KEY,
  SHARED_XP_KEY,
  DIFFICULTY_KEY,
  LANGUAGE_KEY,
} from "@/data/storageKeys";
import type { GameLanguage } from "@/data/settings/language";
import { applyDocumentLanguage } from "@/utils/documentLanguage";
import { slotKey } from "@/services/save/slotManager";
import { type SettingsReturn, settingsStore } from "./constants";

export function useSettings(): SettingsReturn {
  const s = settingsStore.useValue();

  const setDialogueSpeed = useCallback((speed: DialogueSpeed) => {
    localStorage.setItem(DIALOGUE_SPEED_KEY, speed);
    settingsStore.emitChange();
  }, []);

  const setShowQuestIndicator = useCallback((show: boolean) => {
    localStorage.setItem(SHOW_QUEST_INDICATOR_KEY, String(show));
    settingsStore.emitChange();
  }, []);

  const setShowComboAction = useCallback((show: boolean) => {
    localStorage.setItem(SHOW_COMBO_ACTION_KEY, String(show));
    settingsStore.emitChange();
  }, []);

  const setShowHighlight = useCallback((show: boolean) => {
    localStorage.setItem(SHOW_HIGHLIGHT_KEY, String(show));
    settingsStore.emitChange();
  }, []);

  const setShowAbilityIntro = useCallback((show: boolean) => {
    localStorage.setItem(SHOW_ABILITY_INTRO_KEY, String(show));
    settingsStore.emitChange();
  }, []);

  const setSharedXp = useCallback((shared: boolean) => {
    localStorage.setItem(SHARED_XP_KEY, String(shared));
    settingsStore.emitChange();
  }, []);

  const setDifficulty = useCallback((difficulty: NpcDifficulty) => {
    localStorage.setItem(slotKey(DIFFICULTY_KEY), difficulty);
    settingsStore.emitChange();
  }, []);

  const setLanguage = useCallback((language: GameLanguage) => {
    localStorage.setItem(LANGUAGE_KEY, language);
    applyDocumentLanguage(language);
    settingsStore.emitChange();
  }, []);

  return useMemo(
    () => ({
      ...s,
      dialogueSpeedMs: SPEED_MAP[s.dialogueSpeed],
      setDialogueSpeed,
      setShowQuestIndicator,
      setShowComboAction,
      setShowHighlight,
      setShowAbilityIntro,
      setSharedXp,
      setDifficulty,
      setLanguage,
    }),
    [
      s,
      setDialogueSpeed,
      setShowQuestIndicator,
      setShowComboAction,
      setShowHighlight,
      setShowAbilityIntro,
      setSharedXp,
      setDifficulty,
      setLanguage,
    ],
  );
}
