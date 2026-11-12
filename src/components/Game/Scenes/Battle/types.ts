import type { ReactNode } from "react";
import type { BattleMapConfig } from "@/utils/types/maps/battle";
import type { PvpSide } from "@/hooks/battle/coop/types";
import type { PvpBestOf } from "@/hooks/battle/pvp/usePvpMatch";

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
  /** Líder da batalha co-op (quem iniciou). Ausente = o próprio jogador. */
  battleLeaderId?: string;
  /** PvP usa a lógica de oponente; batalhas contra NPC são co-op de guilda. */
  isPvp?: boolean;
  /** Oponente do duelo (id do jogador na sala). */
  pvpOpponentId?: string;
  /** Lado da arena deste jogador no duelo. */
  pvpSide?: PvpSide;
  /** Tamanho da série do duelo. */
  pvpBestOf?: PvpBestOf;
};

export type BattleBackgroundProps = {
  effectiveBackground?: string;
  zoom: number;
  adjustedBgX: number;
  adjustedBgY: number;
  shake: { x: number; y: number };
  tvFlash: boolean;
};
