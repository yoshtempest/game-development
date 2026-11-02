import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import type { BattleManaApi } from "@/contexts/BattleManaContext";

import type { useBattleRefs } from "@/hooks/battle/utilities/useRefs";
import type { useBattleSystem } from "@/hooks/battle/main/battleSystem/useSystem";
import type { CharactersProgress } from "@/data/characters/defaultProgress";
import type { SphereNpc } from "../types";
import type { MarshadowBattleForm } from "@/utils/paths/characters/marshadow/types";


export type Props = {
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  battle: ReturnType<typeof useBattleSystem>;
  npc: SphereNpc;
  summons: SummonedNpc[];
  setSummons: Dispatch<SetStateAction<SummonedNpc[]>>;
  playerClass: PlayerClass;
  progress: CharactersProgress;
  giveSummonRewards: (npcClass: NPCClass) => void;
  battleManaRef: RefObject<BattleManaApi | null>;
  freezeActionsUntilRef: RefObject<number>;
  timeRef: RefObject<TimeEffect[]>;
  refs: ReturnType<typeof useBattleRefs>;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  startSpecialIntro: (
    character: string,
    onActivate: () => void,
    ability?: string,
    form?: MarshadowBattleForm,
    onCancel?: () => void,
  ) => boolean;
  /** +5 cargas da Expansão pelo uso (a purple conta como dois: 2×). */
  onUsed?: (times?: number) => void;
  isPausedRef: RefObject<boolean>;
  /** Menu da batalha aberto: pausa o tick das esferas para elas não completarem durante a pausa. */
  isMenuOpenRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
  /** Proporção especial/básico (ver `specialDamageRatio` no useBattleCombat). */
  specialDamageRatio: number;
  /**
   * Esfera em voo consumida pelo `useProjectile` (destrói projéteis inimigos).
   * A purple escreve aqui durante a fase `firing` — é o mesmo contrato do
   * projétil especial, só que conduzido por este hook.
   */
  playerProjectileRef: RefObject<PlayerSpecialProjectile | null>;
};
