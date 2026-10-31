import type { BattleObstacle } from "@/utils/types/maps/battle";
import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { useBlinkAnimation } from "@/hooks/battle/player/characters/natsuki/useBlinkAnimation";
import { useBattleStageSetup } from "@/hooks/battle/useBattleStageSetup";
import { useBattleRefs } from "@/hooks/battle/utilities/useRefs";
import { type RefObject } from "react";

export type BattleCombatProps = {
  setup: ReturnType<typeof useBattleStageSetup>;
  refs: ReturnType<typeof useBattleRefs>;
  npcType: string;
  isAlfa: boolean;
  training: boolean;
  obstacles?: BattleObstacle[];
  PLAYER_SIZE: number;
  lootActiveRef: RefObject<boolean>;
  onPlayerDeathRef: RefObject<() => void>;
  onNpcDeathRef: RefObject<() => void>;
  battleManaRef: RefObject<BattleManaApi | null>;
  isPausedRef: RefObject<boolean>;
  isMenuOpenRef: RefObject<boolean>;
  /**
   * Menu da batalha aberto (pausa dirigida pelo jogador), na forma booleana:
   * os hooks de Expansão de Domínio e o intro usam para congelar os próprios
   * timers e prazos, que precisam de reatividade (não de um ref).
   */
  isMenuOpen: boolean;
  honoredOneActiveRef: RefObject<boolean>;
  honoredFleeRef: RefObject<boolean>;
  surviveLethalHitRef: RefObject<() => boolean>;
  /** O Abençoado está na coreografia (gatilho → pouso): trava todo controle. */
  honoredSequence: boolean;
  honoredRegenActive: boolean;
  vastolordMultiplierRef: RefObject<() => number>;
  vastolordActive: boolean;
  /** Quadro da transformação do marshadow (0=screamOne … 3=transformated) ou null. */
  transformationFrame: number | null;
  /** Aumenta a duração restante da Forma Vastolord (passiva do marshadow). */
  extendVastolordRef: RefObject<(ms: number) => void>;
  cursedEnergyEnabled: boolean;
  onKokusenRef: RefObject<() => void>;
  onBlackFlashRef: RefObject<() => void>;
  onDivergentFistConsumedRef: RefObject<() => void>;
  triggerBlink: ReturnType<typeof useBlinkAnimation>["triggerBlink"];
  divergentFistActive: boolean;
  divergentFistRef: RefObject<boolean>;
  setDivergentFistActive: React.Dispatch<React.SetStateAction<boolean>>;
};