import type { Dispatch, RefObject, SetStateAction } from "react";

import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { PlaySound } from "@/utils/types/audio";
import type { NPCBattleState } from "@/utils/types/npc/npc";
import type { PetState } from "@/hooks/battle/player/pets/pet/types";
import type { BattleObstacle } from "@/utils/types/maps/battle";
import type { BabidiPortalWarpFn } from "@/legacy/babidiPortals/types";

export type Props = {
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  npc: {
    x: number;
    y: number;
    updateNpc: (partial: Partial<NPCBattleState>) => void;
  };
  summons: SummonedNpc[];
  setSummons: Dispatch<SetStateAction<SummonedNpc[]>>;
  allies: SummonedNpc[];
  setAllies: Dispatch<SetStateAction<SummonedNpc[]>>;
  pet: PetState;
  setPet: Dispatch<SetStateAction<PetState>>;
  obstacles?: BattleObstacle[];
  PLAYER_SIZE: number;
  battleManaRef: RefObject<BattleManaApi | null>;
  timeRef: RefObject<TimeEffect[]>;
  freezeActionsUntilRef: RefObject<number>;
  isPausedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
  playSound: PlaySound;
  /**
   * Saída do warp de projéteis: o hook publica aqui a função que os loops de
   * projétil (NPC e energia do babidi) chamam para atravessar os portais.
   */
  portalWarpRef: RefObject<BabidiPortalWarpFn | null>;
};
