import type { DamageArmor } from "@/utils/types/battle/damageKind";

export type Props = {
  allies: SummonedNpc[];
  setAllies: React.Dispatch<React.SetStateAction<SummonedNpc[]>>;
  enemySummons: SummonedNpc[];
  setEnemySummons: React.Dispatch<React.SetStateAction<SummonedNpc[]>>;
  isPaused: boolean;
  isEnding: boolean;
  enemyNpc: { x: number; y: number; npcType: string };
  npcHp: number;
  npcArmor: DamageArmor;
  setNpcHP: React.Dispatch<React.SetStateAction<number>>;
  npcLevel: number;
  difficulty: NpcDifficulty;
  spawnDamageRef: React.RefObject<
    (value: number, x: number, y: number, type: DamageType) => void
  >;
  timeRef: React.RefObject<TimeEffect[]>;
};
