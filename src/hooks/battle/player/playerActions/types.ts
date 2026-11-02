
import type { SpecialHitOptions } from "@/utils/types/battle/specialHitOptions";
import type { CharactersProgress } from "@/data/characters/defaultProgress";
import type { BabidiTarget } from "@/utils/types/character/babidi";
import type { VampirismStats } from "@/gameRules/battle/vampirism/applyVampirism";

export type Props = {
  player: Player;
  npc: {
    x: number;
    y: number;
  };
  summons: SummonedNpc[];
  npcHP: number;
  npcClass: NPCClass;
  playerClass: PlayerClass;
  weapon?: YvelWeapon;
  progress: CharactersProgress;
  npcLevel: number;
  battle: {
    playerCooldown: React.RefObject<boolean>;
    isEnding: React.RefObject<boolean>;
    playerHit: (
      multiplier?: number,
      bypassCanPlayerHit?: boolean,
      bypassCooldown?: boolean,
    ) => void;
    specialHit: (
      multiplier?: number,
      bypassRangeCheck?: boolean,
      options?: SpecialHitOptions,
    ) => void;
    setDelicia: React.Dispatch<React.SetStateAction<number>>;
    hitsToSpecial: number;
  };

  setSummons: React.Dispatch<React.SetStateAction<SummonedNpc[]>>;

  giveSummonRewards: (npcClass: NPCClass) => void;

  spawnDamageRef: React.RefObject<
    (value: number, x: number, y: number, type: DamageType) => void
  >;
  registerHitRef: React.RefObject<(damage: number) => void>;

  setPlayerHP: React.Dispatch<React.SetStateAction<number>>;
  playerHP: number;
  playerMaxHp: number;
  vampirism: VampirismStats;
  onNpcPush?: (targetX: number) => void;
  /** Multiplicador do último step do combo do ematron (lido no press). */
  ematronComboMultiplierRef?: React.RefObject<number>;
  /** true quando o último press do ematron AVANÇOU o combo. */
  ematronComboActiveRef?: React.RefObject<boolean>;
  /** Combo do ematron: true durante a sequência aérea (airKick windup). */
  ematronComboAirActiveRef?: React.RefObject<boolean>;
  /** Índice do último step do combo do ematron (lido no press). */
  ematronComboStepIndexRef?: React.RefObject<number>;
  /** Avança o player um passo em direção ao alvo atingido (combo do ematron). */
  onComboAdvance?: (forwardDistance: number, targetX: number) => void;
  /** Básico do babidi: dispara o projétil no press (devolve se disparou). */
  babidiFireRef?: React.RefObject<
    ((player: Player, targets: BabidiTarget[]) => boolean) | null
  >;
  /** Colisão do projétil do babidi com um alvo (resolve o dano básico). */
  babidiOnHitRef?: React.RefObject<((target: BabidiTarget) => void) | null>;
  /** Fire do missile do babidi (withMissile). */
  babidiMissileFireRef?: React.RefObject<
    ((player: { x: number; y: number }) => boolean) | null
  >;
  /** Colisão do missile do babidi com um alvo. */
  babidiMissileOnHitRef?: React.RefObject<((target: BabidiTarget) => void) | null>;
  /** Modo de ataque básico do babidi selecionado pelo jogador. */
  babidiAttackMode?: "withGun" | "withMissile";
};
