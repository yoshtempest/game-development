import type { ReactNode } from "react";
import type { BattleMapConfig } from "@/utils/types/maps/battle";

export type AbilitySlot = {
  click?: () => void;
  press?: () => void;
  release?: () => void;
  disabled: boolean;
  hold: boolean;
  abilityId?: string;
};

export type Props = {
  npcType: string;
  redirectTo?: string;
  victoryDescription: string;
  className?: string;
  background?: string;
  audioSrc: string;
  introAudioSrc?: string;
  onVictory?: () => void;
  map?: BattleMapConfig;
  training?: boolean;
  isAlfa?: boolean;
  npcLevel?: number;
  machineGamaShield?: number;
  machineGamaShieldMax?: number;
  children?: ReactNode;
  hakai?: boolean;
  playerCount?: number;
};

export type BattleBackgroundProps = {
  effectiveBackground?: string;
  zoom: number;
  adjustedBgX: number;
  adjustedBgY: number;
  shake: { x: number; y: number };
  tvFlash: boolean;
};