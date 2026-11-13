import { createExternalStore } from "@/utils/createExternalStore";
import type { DialogueSpeed } from "@/utils/settings";
import type { GameLanguage } from "@/data/settings/language";
import { readSettings } from "./readSettings";

export type Settings = {
  dialogueSpeed: DialogueSpeed;
  showQuestIndicator: boolean;
  showComboAction: boolean;
  showHighlight: boolean;
  /** Intro visual de abertura das habilidades do jogador (SpecialIntro). */
  showAbilityIntro: boolean;
  sharedXp: boolean;
  difficulty: NpcDifficulty;
  /** Idioma do menu de config; só controla a oferta de tradução do navegador. */
  language: GameLanguage;
};

export const settingsStore = createExternalStore(readSettings);

export type SettingsReturn = Settings & {
  dialogueSpeedMs: number;
  setDialogueSpeed: (speed: DialogueSpeed) => void;
  setShowQuestIndicator: (show: boolean) => void;
  setShowComboAction: (show: boolean) => void;
  setShowHighlight: (show: boolean) => void;
  setShowAbilityIntro: (show: boolean) => void;
  setSharedXp: (shared: boolean) => void;
  setDifficulty: (difficulty: NpcDifficulty) => void;
  setLanguage: (language: GameLanguage) => void;
};
