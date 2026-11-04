import type { Dispatch, RefObject, SetStateAction } from "react";

import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { BabidiBombDropVisual } from "@/utils/types/character/babidi";
import type { PlaySound } from "@/utils/types/audio";

export type Props = {
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  npc: { x: number; y: number };
  battleManaRef: RefObject<BattleManaApi | null>;
  freezeActionsUntilRef: RefObject<number>;
  isPausedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
  playSound: PlaySound;
  /** Dano da explosão: `specialHit` mágico de 1x, sem cobrar a carga de novo. */
  onHit: () => void;
  /** Consumo contabilizado (carga da Expansão de Domínio). */
  onUsed: () => void;
  cooldownReduction: number;
};

export type BabidiBombDropApi = {
  visual: BabidiBombDropVisual | null;
  press: () => void;
  usable: boolean;
  remaining: number;
  cost: number;
};
