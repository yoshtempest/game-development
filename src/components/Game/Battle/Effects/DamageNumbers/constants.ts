import type { DamageNumber } from "@/hooks/battle/damage/useNumbers";
import type { DamageTarget } from "@/utils/battle/findDamageTarget";
import styles from "./styles.module.css";

export type DamageNumbersProps = {
  numbers: DamageNumber[];
  scaleX: number;
  scaleY: number;
  targets: DamageTarget[];
};

export const TYPE_CLASS: Record<string, string> = {
  player: styles.player!,
  npc: styles.npc!,
  special: styles.special!,
  pet: styles.pet!,
  summon: styles.summon!,
  projectile: styles.projectile!,
  blocked: styles.blocked!,
  parry: styles.parry!,
  reflect: styles.reflect!,
  crit: styles.crit!,
  charge: styles.charge!,
  miss: styles.miss!,
  burn: styles.burn!,
  poison: styles.poison!,
  freeze: styles.freeze!,
  confuse: styles.confuse!,
  armor: styles.armor!,
  heal: styles.heal!,
};