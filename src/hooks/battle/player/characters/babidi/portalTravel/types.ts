import type { Dispatch, RefObject, SetStateAction } from "react";
import type { PetState } from "@/hooks/battle/player/pets/pet/types";
import type { PlaySound } from "@/utils/types/audio";
import type { NPCBattleState } from "@/utils/types/npc/npc";
import type { BattleObstacle } from "@/utils/types/maps/battle";
import type { BabidiPortal } from "@/utils/types/character/babidi";

export type Props = {
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  npc: {
    x: number;
    y: number;
    updateNpc: (partial: Partial<NPCBattleState>) => void;
  };
  summonsRef: RefObject<SummonedNpc[]>;
  alliesRef: RefObject<SummonedNpc[]>;
  petRef: RefObject<PetState>;
  setSummons: Dispatch<SetStateAction<SummonedNpc[]>>;
  setAllies: Dispatch<SetStateAction<SummonedNpc[]>>;
  setPet: Dispatch<SetStateAction<PetState>>;
  portalsRef: RefObject<BabidiPortal[]>;
  disarmedRef: RefObject<Set<string>>;
  obstaclesRef: RefObject<BattleObstacle[]>;
  playSoundRef: RefObject<PlaySound>;
};
