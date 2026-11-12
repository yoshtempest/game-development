import type { DamageKind } from "@/utils/types/battle/damageKind";
import type { NewPlayerStatus } from "@/utils/types/battle/status";

export type Props = {
  summons: SummonedNpc[];
  setSummons: React.Dispatch<React.SetStateAction<SummonedNpc[]>>;
  isPaused: boolean;
  playerX: number;
  playerY: number;
  playerClass: PlayerClass;
  playerCharacter: CharacterId;
  npcLevel: number;
  difficulty: NpcDifficulty;
  damagePlayer: (
    damage: number,
    damageKind?: DamageKind,
    attackerX?: number,
  ) => void;
  spawnDamageRef: React.RefObject<
    (value: number, x: number, y: number, type: DamageType) => void
  >;
  timeRef: React.RefObject<TimeEffect[]>;
  freezeUntilRef?: React.RefObject<number>;
  /**
   * Aplica status no player (grito de summon, `SUMMON_SHOUTS`). Opcional: sem
   * ele o grito ainda causa dano, só não aplica o status.
   */
  applyStatus?: (status: NewPlayerStatus) => void;
  /** Chamado quando um summon inimigo morre (hp <= 0) por qualquer fonte. */
  onSummonKilled?: () => void;
  rootedSummonsUntilRef?: React.RefObject<Record<string, number>>;
  honoredFleeRef?: React.RefObject<boolean>;
};
