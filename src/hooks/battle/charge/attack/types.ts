import type { VampirismStats } from "@/gameRules/battle/vampirism/applyVampirism";
import type { DamageArmor } from "@/utils/types/battle/damageKind";

export type Props = {
  player: Player;
  npcX: number;
  npcY: number;
  npcType: string;
  npcArmor: DamageArmor;
  npcClass: NPCClass;
  char: { level: number; stats: { strength: number } };
  playerClass: PlayerClass;
  critRate: number;
  titleDamageBonus: number;
  elementDamageBonus: number;
  setNpcHP: React.Dispatch<React.SetStateAction<number>>;
  playerCooldown: React.RefObject<boolean>;
  isEnding: React.RefObject<boolean>;
  timeRef: React.RefObject<TimeEffect[]>;
  spawnDamageRef: React.RefObject<
    (value: number, x: number, y: number, type: DamageType) => void
  >;
  registerHitRef: React.RefObject<(damage: number) => void>;
  setPlayerState: (state: PlayerState) => void;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  summons: SummonedNpc[];
  setSummons: React.Dispatch<React.SetStateAction<SummonedNpc[]>>;
  setDelicia: React.Dispatch<React.SetStateAction<number>>;
  hitsToSpecial: number;
  setPlayerHP: React.Dispatch<React.SetStateAction<number>>;
  playerHP: number;
  playerMaxHp: number;
  vampirism: VampirismStats;
  weapon?: YvelWeapon;
  /**
   * Forja da carga do yvel (issue #217): equipa a arma sorteada ao soltar o
   * ataque carregado. Ausente para os demais personagens.
   */
  equipWeapon?: (weapon: YvelWeapon) => boolean;
  /** Multiplicador da Forma Vastolord aplicado no dano do dash. */
  vastolordMultiplierRef?: React.RefObject<() => number>;
};
