import type { NPCBattleState } from "@/utils/types/npc/npc";
import type {
  GroundPaper,
  FlyingPaper,
  StuckPaper,
  LaserBeam,
} from "@/services/npc/attacks/maugrelo/state";

import type { PetState } from "@/hooks/battle/player/pets/pet/types";
import type { CoffinState } from "@/hooks/battle/summon/coffinAnimation/types";
import type { KillerQueenOverlay } from "@/utils/types/character/srGuaxinim";
import type { ExtraPunchVisual } from "@/utils/types/character/srGuaxinim";
import type { BattleLootBag } from "@/utils/types/battle/loot";
import type { BlinkVisual } from "@/hooks/battle/player/characters/natsuki/blinkAnimation/types";
import type { EmatronCloneVisual } from "@/utils/types/character/ematron";
import type { GenkiDamaVisual } from "@/utils/types/character/ematron";
import type { VastolordLaserBeam } from "@/gameRules/battle/characters/marshadow/vastolordLaser";
import type { KamehamehaEffect } from "@/gameRules/battle/characters/ematron/kamehameha";
import type { GranReyCeroEffect } from "@/gameRules/battle/characters/marshadow/granReyCero";
import type { CutInEnemieOverlay } from "@/utils/types/battle/cutInEnemie";
import type { AtomicExplosion, AtomicCut } from "@/utils/types/battle/atomic";
import type {
  MugetsuSweep,
  MugetsuBlink,
  MugetsuDisintegrationTarget,
} from "@/utils/types/battle/mugetsu";
import type {
  BabidiBombDropVisual,
  BabidiCloneVisual,
  BabidiEnergyProjectile,
  BabidiMissileProjectile,
  BabidiShieldSide,
  BabidiShieldSides,
} from "@/utils/types/character/babidi";
import type { BabidiAttackVariant } from "@/utils/types/character/babidi/attack";

export type BattleEntitiesBattle = {
  piercings: { id: number; x: number; y: number }[];
  isExploding: boolean;
  npcPhase: number;
  isNpcDying: boolean;
};

export type BattleEntityPositioning = {
  battleScaleX: number;
  battleScaleY: number;
};

export type MainNpcState = NPCBattleState & {
  projectile: Projectile | null;
  projectiles: Projectile[];
  groundPapers: GroundPaper[];
  stuckPapers: StuckPaper[];
  flyingPaper: FlyingPaper | null;
  laser: LaserBeam | null;
};

export type Props = {
  npc: MainNpcState;
  player: Player;
  battle: BattleEntitiesBattle;
  npcType: string;
  summons: SummonedNpc[];
  allies: SummonedNpc[];
  coffins: CoffinState[];
  pet: PetState;
  lootBags?: BattleLootBag[];
  npcClass?: NPCClass;
  TILE_SIZE: number;
  PLAYER_SIZE: number;
  grabFlipped?: boolean;
  isAlfa?: boolean;
  playerProjectile?: PlayerSpecialProjectile | null;
  killerQueen?: KillerQueenOverlay | null;
  bombTargets?: BombTarget[];
  killerQueenSprite?: (sprite: KillerQueenOverlay["sprite"]) => string;
  bombSprite?: string;
  explosionSprite?: string;
  extraPunches?: ExtraPunchVisual[];
  extraPunchSprite?: string;
  weapon?: string;
  /** Pasta de sprites do marshadow durante a Forma Vastolord. */
  playerForm?: "vastolordForm";
  /** Quadro da transformação do marshadow (0=screamOne … 3=transformated) ou null. */
  transformationFrame?: number | null;
  /** Estado da coreografia do blink do natsuki (silhuetas de origem/destino). */
  blinkVisual?: BlinkVisual | null;
  /** Cópia de silhueta do Ematron durante o hold da instância. */
  ematronClone?: EmatronCloneVisual | null;
  /** Esfera da Genki Dama do Ematron (preparando ou voando). */
  genkiDamaVisual?: GenkiDamaVisual | null;
  /** Feixe do Laser da Forma Vastolord do marshadow. */
  vastolordLaser?: VastolordLaserBeam | null;
  /** Feixe de Kamehameha do ematron (em curso, ou null). */
  kamehameha?: KamehamehaEffect | null;
  granReyCeroEffect?: GranReyCeroEffect | null;
  /** CutInEnemie do marshadow sobrepondo o NPC atingido. */
  cutInEnemie?: CutInEnemieOverlay | null;
  /** NPC em sangramento (bloodIcon acima da imagem). */
  npcBleeding?: boolean;
  /** Durante o specialBackground: jogador troca para o sprite preAtomic.svg. */
  preAtomic?: boolean;
  /** Vitória/derrota: jogador troca para expressions/<tipo>.svg (battleOutro). */
  outroExpression?: "victory" | "defeat" | null;
  /** Halo.svg acima do jogador durante preparing/finalizating do "I Am Atomic". */
  atomicHalo?: boolean;
  /** Flash no sprite do jogador na explosão do "I Am Atomic". */
  atomicFlash?: boolean;
  /** Explosão centrada no alvo (inimigo de maior vida máxima). */
  atomicExplosion?: AtomicExplosion | null;
  /** CutInEnemie sobre cada inimigo atingido dentro do raio. */
  atomicCuts?: AtomicCut[];
  /** Varredura do mugetsuEffect da Expansão de Domínio do marshadow. */
  mugetsuSweep?: MugetsuSweep | null;
  /** Blink do teleporte da Expansão de Domínio. */
  mugetsuBlink?: MugetsuBlink;
  /** Alvos sendo desintegrados em pó pela varredura. */
  disintegrating?: MugetsuDisintegrationTarget[];
  domainExpansionActive?: boolean;
  /** Projéteis de energia do ataque básico do babidi. */
  babidiEnergyProjectiles?: BabidiEnergyProjectile[];
  babidiMissileProjectiles?: BabidiMissileProjectile[];
  fishingNet?: { x: number; y: number } | null;
  babidiClones?: BabidiCloneVisual[];
  /** Portal/bomba/explosão da Energia Dimensional do babidi. */
  babidiBombDrop?: BabidiBombDropVisual | null;
  /** Pose de mão do sprite do ataque básico do babidi. */
  babidiAttackVariant?: BabidiAttackVariant;
  babidiMachineGamaControl?: boolean;
  /** Nonces dos shields de bloqueio do babidi por lado (`0` = inativo). */
  babidiShieldSides?: BabidiShieldSides;
  /** Encerra o shield de um lado quando ele termina o fade-out. */
  onBabidiShieldEnd?: (side: BabidiShieldSide, nonce: number) => void;
  /** Furo no sprite do NPC quando a purple o mata (junto com `isDying`). */
  purpleHole?: boolean;
  hakai?: boolean;
  sigiloPhase?: string;
};
