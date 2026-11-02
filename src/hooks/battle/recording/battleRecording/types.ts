import type {
  PlayerSnap,
  NpcSnap,
  BattleSnap,
  DamageNum,
  SummonSnap,
  PetSnap,
} from "@/utils/types/replay";
import type { ComboRank } from "@/utils/types/battle/combo";

export type Props = {
  playerRef: React.RefObject<PlayerSnap>;
  npcRef: React.RefObject<NpcSnap>;
  battleRef: React.RefObject<BattleSnap>;
  damageNumbersRef: React.RefObject<DamageNum[]>;
  summonsRef: React.RefObject<SummonSnap[]>;
  petRef: React.RefObject<PetSnap>;
  comboRef: React.RefObject<{
    count: number;
    rank: ComboRank;
    progress: number;
    nextRank: ComboRank | null;
  }>;
  comboActionRef: React.RefObject<PlayerState | null>;
  npcType: string;
  npcLevel: number;
  npcClass: NPCClass;
  playerCharacter: CharacterId;
  playerLevel: number;
  background: string;
  audioSrc: string;
};
