import { useLatestRef } from "@/hooks/useLatestRef";
import { getComboAction } from "@/data/battle/comboActions";
import type { useNpcAI } from "@/hooks/battle/npc/useAi";
import type { useBattleSystem } from "@/hooks/battle/main/battleSystem/useSystem";
import type { ComboRank } from "@/utils/types/battle/combo";
import type { SummonedNpc } from "@/utils/types/npc/npc";
import type {
  BattleSnap,
  DamageNum,
  NpcSnap,
  PetSnap,
  PlayerSnap,
} from "@/utils/types/replay";

type Props = {
  player: Player;
  npc: ReturnType<typeof useNpcAI>;
  battle: ReturnType<typeof useBattleSystem>;
  comboCount: number;
  comboRank: ComboRank;
  comboProgress: number;
  nextRank: ComboRank | null;
  summons: SummonedNpc[];
  controlsDisabled: boolean;
};

export function useBattleSnapshots({
  player,
  npc,
  battle,
  comboCount,
  comboRank,
  comboProgress,
  nextRank,
  summons,
  controlsDisabled,
}: Props) {
  const playerSnapshotRef = useLatestRef<PlayerSnap>({
    x: player.x,
    y: player.y,
    state: player.state,
    battleDirection: player.battleDirection,
    character: player.character,
    direction: player.direction,
    grabbedUntil: player.grabbedUntil ?? 0,
  });

  const npcSnapshotRef = useLatestRef<NpcSnap>({
    x: npc.x,
    y: npc.y,
    state: npc.state,
    direction: npc.direction,
    jumpLandingX: npc.jumpLandingX,
  });

  const battleSnapshotRef = useLatestRef<BattleSnap>({
    playerHP: battle.playerHP,
    playerMaxHp: battle.playerMaxHp,
    playerShield: battle.playerShield,
    npcHP: battle.npcHP,
    npcMaxHp: battle.npcMaxHp,
    npcPhase: battle.npcPhase ?? 1,
    delicia: battle.delicia,
    hitsToSpecial: battle.hitsToSpecial,
    blockGauge: battle.blockGauge,
    blockLimit: battle.blockLimit,
  });

  const petSnapshotRef = useLatestRef<PetSnap>(battle.pet);

  const comboSnapshotRef = useLatestRef({
    count: comboCount,
    rank: comboRank,
    progress: comboProgress,
    nextRank,
  });

  const comboActionSprite = !controlsDisabled
    ? (getComboAction(player.state)?.sprite ?? null)
    : null;
  const comboActionRef = useLatestRef(comboActionSprite);

  const damageNumbersSnapshotRef = useLatestRef<DamageNum[]>(
    battle.damageNumbers,
  );

  const summonsSnapshotRef = useLatestRef<SummonedNpc[]>(summons);

  const npcProjectilesSnapshotRef = useLatestRef<Projectile[]>(npc.projectiles);

  return {
    playerSnapshotRef,
    npcSnapshotRef,
    battleSnapshotRef,
    petSnapshotRef,
    comboSnapshotRef,
    comboActionRef,
    damageNumbersSnapshotRef,
    summonsSnapshotRef,
    npcProjectilesSnapshotRef,
  } as const;
}
