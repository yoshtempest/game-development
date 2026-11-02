import type { ComboRank } from "@/utils/types/battle/combo";
import type { DamageArmor } from "@/utils/types/battle/damageKind";
import type {
  NPCBattleState,
  NPCDirection,
} from "@/utils/types/npc/npc";

export type ReplayFrame = {
  t: number;

  px: number;
  py: number;
  ps: PlayerState;
  pd: Direction;
  pchar: CharacterId;
  pdir: Direction;
  php: number;
  pmaxhp: number;
  pshield: number;

  nx: number;
  ny: number;
  ns: NPCBattleState["state"];
  ndir: NPCDirection;
  nhp: number;
  nmaxhp: number;
  npcPhase: number;

  del: number;
  hits: number;
  blockGauge: number;
  blockLimit: number;

  cc: number;
  cr: ComboRank;
  cprog: number;
  cnext: ComboRank | null;

  dmg: { v: number; x: number; y: number; c: boolean; ty: DamageType }[];
  sm: {
    id: string;
    x: number;
    y: number;
    t: NpcType;
    st: SummonedNpc["state"];
    dir: NPCDirection;
    hp: number;
    /** Colunas de armadura do summon no momento do frame (usadas pelo rewind). */
    armor: DamageArmor;
  }[];

  petx: number | null;
  pety: number | null;
  petst: string | null;
  petdir: "left" | "right" | null;
  petType: string | null;

  comboAction: PlayerState | null;
};

export type AudioLogEvent = {
  t: number;
  sound: string;
  op: "play" | "stop";
  loop: boolean;
};

export type ReplayData = {
  id: string;
  /** Pode ser um NpcType ou o identificador sintético "__training". */
  npcType: string;
  npcLevel: number;
  npcClass: NPCClass;
  playerCharacter: CharacterId;
  playerLevel: number;
  background: string;
  audioSrc: string;
  date: string;
  duration: number;
  frames: ReplayFrame[];
  audioEvents: AudioLogEvent[];
};

export type PlayerSnap = {
  x: number;
  y: number;
  state: PlayerState;
  battleDirection: Direction;
  character: CharacterId;
  direction: Direction;
  grabbedUntil: number;
};

export type NpcSnap = {
  x: number;
  y: number;
  state: NPCBattleState["state"];
  direction: NPCDirection;
  jumpLandingX?: number;
};

export type BattleSnap = {
  playerHP: number;
  playerMaxHp: number;
  playerShield: number;
  npcHP: number;
  npcMaxHp: number;
  npcPhase: number;
  delicia: number;
  hitsToSpecial: number;
  blockGauge: number;
  blockLimit: number;
};

export type DamageNum = {
  value: number;
  x: number;
  y: number;
  type: DamageType;
};

export type SummonSnap = {
  id: string;
  x: number;
  y: number;
  npcType: NpcType;
  state: SummonedNpc["state"];
  direction: NPCDirection;
  hp: number;
  /** Colunas de armatura no momento do frame (o rewind precisa restaurá-las). */
  armor: DamageArmor;
};

export type PetSnap = {
  x: number;
  y: number;
  direction: "left" | "right";
  state: string;
  npcType: string;
} | null;
