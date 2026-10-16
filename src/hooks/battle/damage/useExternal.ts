import { useCallback } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { isParryPress } from "@/hooks/battle/npc/isParryPress";
import { combatService } from "@/services/combat";
import { getShieldSide } from "@/gameRules/battle/characters/lucaua/lucauaShield";
import type { DamageArmor, DamageKind } from "@/utils/types/battle/damageKind";
import type { SpawnDamageFn } from "@/utils/types/battle/spawnDamageFn";
import type { LucauaShieldSide } from "@/utils/types/character/lucaua";

type Props = {
  playerX: number;
  playerY: number;
  player: Player;
  totalArmor: DamageArmor;
  blockGauge: number;
  playerShield: number;
  playerHP: number;
  setPlayerHP: React.Dispatch<React.SetStateAction<number>>;
  setPlayerShield: React.Dispatch<React.SetStateAction<number>>;
  setBlockGauge: React.Dispatch<React.SetStateAction<number>>;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  spawnDamageRef: React.RefObject<SpawnDamageFn>;
  onBlockRef?: React.RefObject<(side?: LucauaShieldSide) => void>;
  oneHitShieldRef?: React.RefObject<boolean>;
  lastBlockPressRef: React.RefObject<number>;
  lastAttackPressRef?: React.RefObject<number>;
  onParry?: () => void;
  onDamageTaken?: () => void;
  /** Passiva O Abençoado: se retornar true, o golpe letal reduz a vida a 1. */
  surviveLethalHitRef?: React.RefObject<() => boolean>;
};

export function useExternalDamage({
  playerX,
  playerY,
  player,
  totalArmor,
  blockGauge,
  playerShield,
  playerHP,
  setPlayerHP,
  setPlayerShield,
  setBlockGauge,
  setPlayer,
  spawnDamageRef,
  onBlockRef,
  oneHitShieldRef,
  lastBlockPressRef,
  lastAttackPressRef,
  onParry,
  onDamageTaken,
  surviveLethalHitRef,
}: Props) {
  const playerShieldRef = useLatestRef(playerShield);
  const playerHPRef = useLatestRef(playerHP);
  const onDamageTakenRef = useLatestRef(onDamageTaken);

  const damagePlayerHp = useCallback(
    (damage: number): boolean => {
      onDamageTakenRef.current?.();
      if (oneHitShieldRef?.current) {
        oneHitShieldRef.current = false;
        spawnDamageRef.current?.(0, playerX, playerY - 40, "blocked");
        return false;
      }
      const shield = playerShieldRef.current;
      if (shield >= damage) {
        setPlayerShield((s) => s - damage);
        return false;
      }
      setPlayerShield(0);
      const remaining = damage - shield;
      if (
        playerHPRef.current - remaining <= 0 &&
        surviveLethalHitRef?.current?.()
      ) {
        setPlayerHP(1);
        return true;
      }
      setPlayerHP((hp) => Math.max(0, hp - remaining));
      return false;
    },
    [
      setPlayerHP,
      setPlayerShield,
      playerShieldRef,
      playerHPRef,
      oneHitShieldRef,
      spawnDamageRef,
      playerX,
      playerY,
      onDamageTakenRef,
      surviveLethalHitRef,
    ],
  );

  /**
   * Dano vindo de fora do NPC principal (summons inimigos). Reduz pela coluna
   * de armadura que a natureza do golpe dictate — pela MESMA função que o melee
   * do NPC usa, que era a diferença entre os dois caminhos.
   */
  const damagePlayer = useCallback(
    (
      damage: number,
      damageKind: DamageKind = "physical",
      attackerX?: number,
    ) => {
      const shieldSide =
        attackerX === undefined ? undefined : getShieldSide(attackerX, playerX);

      if (isParryPress(lastBlockPressRef, lastAttackPressRef)) {
        onParry?.();
        onBlockRef?.current?.(shieldSide);
        spawnDamageRef.current?.(0, playerX, playerY - 40, "parry");
        return;
      }

      // O block consome o golpe **bruto**, como já fazia antes da divisão da
      // armadura: o medidor não sabe de coluna, então a redução acontece
      // depois que o block decide o que sobra (igual ao melee do NPC).
      if (player.state === "blocked") {
        onBlockRef?.current?.(shieldSide);
        if (blockGauge > 0) {
          if (damage <= blockGauge) {
            setBlockGauge((g) => Math.max(0, g - damage));
            spawnDamageRef.current?.(0, playerX, playerY - 40, "blocked");
            return;
          }
          const remaining = damage - blockGauge;
          setBlockGauge(0);
          const survived = damagePlayerHp(remaining);
          if (!survived) {
            setPlayer((p) => ({ ...p, state: "stun" }));
          }
          spawnDamageRef.current?.(remaining, playerX, playerY, "summon");
          return;
        }

        const halved = Math.max(1, Math.round(damage / 2));
        damagePlayerHp(halved);
        spawnDamageRef.current?.(halved, playerX, playerY, "summon");
        return;
      }

      const reduced = combatService.applyArmor(damage, damageKind, totalArmor);
      damagePlayerHp(reduced);
      spawnDamageRef.current?.(reduced, playerX, playerY, "summon");
    },
    [
      player.state,
      blockGauge,
      playerX,
      playerY,
      totalArmor,
      setBlockGauge,
      setPlayer,
      damagePlayerHp,
      spawnDamageRef,
      onBlockRef,
      onParry,
      lastBlockPressRef,
      lastAttackPressRef,
    ],
  );

  return { damagePlayerHp, damagePlayer };
}
