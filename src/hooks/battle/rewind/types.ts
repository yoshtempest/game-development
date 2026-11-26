import type { PlayerSnap, NpcSnap, BattleSnap } from "@/utils/types/replay";
import type { NPCBattleState } from "@/utils/types/npc/npc";
import type { RefObject } from "react";
import type { RewindResurrection } from "@/utils/types/battle/rewind";

export type Props = {
  character: CharacterId;
  /** Cinemática do "Retrocesso Temporal" em curso (pausa a batalha). */
  rewindResurrection: RewindResurrection | null;
  setRewindResurrection: React.Dispatch<
    React.SetStateAction<RewindResurrection | null>
  >;
  performRewindRef: RefObject<() => boolean>;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  setNpcPhase: React.Dispatch<React.SetStateAction<number>>;
  setSummons: React.Dispatch<React.SetStateAction<SummonedNpc[]>>;
  playerSnapshotRef: RefObject<PlayerSnap>;
  npcSnapshotRef: RefObject<NpcSnap>;
  battleSnapshotRef: RefObject<BattleSnap>;
  npcProjectilesSnapshotRef: RefObject<Projectile[]>;
  summonsSnapshotRef: RefObject<SummonedNpc[]>;
  battle: {
    setPlayerHP: React.Dispatch<React.SetStateAction<number>>;
    setPlayerShield: React.Dispatch<React.SetStateAction<number>>;
    setNpcHP: React.Dispatch<React.SetStateAction<number>>;
    setDelicia: React.Dispatch<React.SetStateAction<number>>;
    isEnding: { current: boolean };
  };
  npc: {
    setNpc: React.Dispatch<React.SetStateAction<NPCBattleState>>;
    setProjectiles: React.Dispatch<React.SetStateAction<Projectile[]>>;
  };
  resetCombo: () => void;
};
