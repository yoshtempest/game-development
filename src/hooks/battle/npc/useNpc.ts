import { useCallback } from "react";
import { NPC_MELEE_COOLDOWN } from "@/data/cooldowns";
import { getNpcStats } from "@/gameRules/npc/npcStats";

import { handleNpcBlocking } from "./useBlocking";
import { isParryPress } from "./isParryPress";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { logPlay } from "@/utils/replay/audioEventLog";
import { getNpcVsPlayerMultiplier } from "@/gameRules/battle/npcVsPlayerDamage";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import { combatService } from "@/services/combat";
import { getBabidiBlockReflect } from "@/gameRules/battle/babidiBlock";
import { applyVampirism } from "@/gameRules/battle/vampirism/applyVampirism";
import type { VampirismStats } from "@/gameRules/battle/vampirism/applyVampirism";
import { atLeastMinDamage } from "@/gameRules/battle/damage/minDamage";
import { checkBlocked } from "./checkBlocked";
import { rollNpcDamage } from "./rollNpcDamage";
import { applyBleed } from "./apply/applyBleed";
import {
  applyHitstop,
  getTime,
  NPC_TIME_ID,
  scaleCooldown,
  type TimeEffect,
} from "@/gameRules/battle/time";

import { clampX } from "@/gameRules/movement/clampX";
import type { DamageArmor, DamageKind } from "@/utils/types/battle/damageKind";
import type { LucauaShieldSide } from "@/utils/types/character/lucaua";

type Props = {
  npcLevel: number;
  npcClass: NPCClass;
  playerClass: PlayerClass;
  playerLevel: number;

  playerX: number;
  playerY: number;
  npcX: number;
  npcY: number;

  player: Player;
  totalArmor: DamageArmor;

  damagePlayerHp: (damage: number) => void;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  setNpcHP: React.Dispatch<React.SetStateAction<number>>;
  totalReflect: number;
  /**
   * A reflexão é dano do PRÓPRIO jogador: paga vampirismo universal. O
   * normal não entra, porque não é o ataque básico dele.
   */
  vampirism: VampirismStats;
  playerMaxHp: number;
  setPlayerHP: React.Dispatch<React.SetStateAction<number>>;
  npcCooldown: React.RefObject<boolean>;
  difficulty: NpcDifficulty;
  isEnding: React.RefObject<boolean>;
  spawnDamageRef: React.RefObject<
    (value: number, x: number, y: number, type: DamageType) => void
  >;
  timeRef: React.RefObject<TimeEffect[]>;
  npcStaggerRef: React.RefObject<number>;
  blockGauge: number;
  setBlockGauge: React.Dispatch<React.SetStateAction<number>>;
  lastBlockPressRef: React.RefObject<number>;
  lastAttackPressRef?: React.RefObject<number>;
  onBlockRef?: React.RefObject<(side?: LucauaShieldSide) => void>;
  titleEnemyMissChance?: number;
  onDamageTakenRef?: React.RefObject<(amount: number) => void>;
  onDodgeRef?: React.RefObject<() => void>;
  onHalfHeal?: () => void;
  onParry?: () => void;

  npcType: string;
  npcHp: number;
  npcMaxHp: number;
  npcPhase: number;
  tenacityReduction: number;
  luckBonus: number;
  statMultiplier?: number;
};

export function useNpcBattle({
  npcLevel,
  npcClass,
  playerClass,
  playerLevel,
  totalArmor,
  damagePlayerHp,
  setPlayer,
  setNpcHP,
  totalReflect,
  vampirism,
  playerMaxHp,
  setPlayerHP,
  npcCooldown,
  playerX,
  playerY,
  npcX,
  npcY,
  player,
  difficulty,
  isEnding,
  spawnDamageRef,
  timeRef,
  npcStaggerRef,
  blockGauge,
  setBlockGauge,
  lastBlockPressRef,
  lastAttackPressRef,
  onBlockRef,
  titleEnemyMissChance = 0,
  onDamageTakenRef,
  onDodgeRef,
  onHalfHeal,
  onParry,
  npcType,
  npcHp,
  npcMaxHp,
  npcPhase,
  tenacityReduction,
  luckBonus,
  statMultiplier = 1,
}: Props) {
  const { playSound } = useSoundEffects();

  const npcHpRef = useLatestRef(npcHp);
  const npcMaxHpRef = useLatestRef(npcMaxHp);
  const tenacityReductionRef = useLatestRef(tenacityReduction);

  /** Estado de time do NPC principal (regra `gameRules/battle/time`). */
  const npcTime = useCallback(
    () => getTime(timeRef.current, "npc", NPC_TIME_ID),
    [timeRef],
  );

  const damagePlayerWithReflect = useCallback(
    (damage: number) => {
      damagePlayerHp(damage);
      if (damage > 0) {
        const reflectPct = Math.min(totalReflect, 10);
        if (reflectPct > 0) {
          // Piso aplicado: um reflexo de 0.4% arredondava para 0 e o golpe
          // refletido simplesmente nao existia.
          const reflectAmt = atLeastMinDamage((damage * reflectPct) / 100);
          setNpcHP((hp) => Math.max(0, hp - reflectAmt));
          spawnDamageRef.current?.(reflectAmt, npcX, npcY, "reflect");
          applyVampirism({
            damage: reflectAmt,
            source: "other",
            vampirism,
            playerMaxHp,
            setPlayerHP,
          });
        }
      }
    },
    [
      damagePlayerHp,
      totalReflect,
      setNpcHP,
      spawnDamageRef,
      npcX,
      npcY,
      vampirism,
      playerMaxHp,
      setPlayerHP,
    ],
  );

  const applyBabidiBlockReflect = useCallback(
    (blockedDamage: number) => {
      const reflect = getBabidiBlockReflect({
        character: player.character,
        playerLevel,
        npcLevel,
        blockedDamage,
        npcHp: npcHpRef.current,
      });
      if (!reflect) return;

      setNpcHP((hp) =>
        reflect.isInstakill ? 0 : Math.max(0, hp - reflect.damage),
      );
      spawnDamageRef.current?.(reflect.damage, npcX, npcY, "reflect");
      applyVampirism({
        damage: reflect.damage,
        source: "other",
        vampirism,
        playerMaxHp,
        setPlayerHP,
      });
    },
    [
      player.character,
      playerLevel,
      npcLevel,
      npcHpRef,
      setNpcHP,
      spawnDamageRef,
      npcX,
      npcY,
      vampirism,
      playerMaxHp,
      setPlayerHP,
    ],
  );

  const onFullBlock = useCallback(() => {
    if (player.character === "marcelo") {
      playSound("swordDeflected");
      logPlay("swordDeflected");
    }
  }, [player.character, playSound]);

  const applyNpcDamage = useCallback(
    (dmg: number, tx: number, ty: number, dmgType: DamageType = "npc") => {
      const blocked = checkBlocked({
        dmg,
        character: player.character,
        playerState: player.state,
        playerBattleDirection: player.battleDirection,
        playerX,
        playerY,
        npcX,
        npcY,
        blockGauge,
        setBlockGauge,
        damagePlayerWithReflect,
        setPlayer,
        spawnDamageRef,
        timeRef,
        npcStaggerRef,
        npcCooldown,
        lastBlockPressRef,
        lastAttackPressRef,
        onFullBlock,
        onBlockRef,
        onParry,
        onDamageBlocked: applyBabidiBlockReflect,
      });
      if (blocked) return;

      damagePlayerWithReflect(dmg);
      spawnDamageRef.current?.(dmg, tx, ty, dmgType);
      navigator.vibrate?.(40);
    },
    [
      damagePlayerWithReflect,
      setPlayer,
      spawnDamageRef,
      playerX,
      playerY,
      npcX,
      npcY,
      player.state,
      player.battleDirection,
      player.character,
      blockGauge,
      setBlockGauge,
      timeRef,
      npcStaggerRef,
      npcCooldown,
      lastBlockPressRef,
      lastAttackPressRef,
      onFullBlock,
      onBlockRef,
      onParry,
      applyBabidiBlockReflect,
    ],
  );

  const npcMeleeHit = useCallback(
    (multiplier = 1, damageKind: DamageKind = "physical") => {
      if (isEnding.current) return;
      if (ALL_PREDICATES.isNpcUnhittable(player.state)) return;

      const skipCooldown = npcType === "maurao" && npcPhase >= 2;

      if (!skipCooldown && !npcCooldown.current) return;

      if (ALL_PREDICATES.isDashing(player.state)) {
        onDodgeRef?.current?.();
        return;
      }
      if (
        ALL_PREDICATES.isCrouched(player.state) &&
        Math.abs(playerX - npcX) > 80
      ) {
        onDodgeRef?.current?.();
        return;
      }

      const tx = playerX;
      const ty = playerY;

      const missChance = 0.005 + titleEnemyMissChance / 100 + luckBonus;
      if (Math.random() < missChance) {
        spawnDamageRef.current?.(0, tx, ty, "miss");
        if (!skipCooldown) {
          npcCooldown.current = false;
          setTimeout(
            () => (npcCooldown.current = true),
            scaleCooldown(npcTime(), NPC_MELEE_COOLDOWN),
          );
        }
        return;
      }

      const npc = getNpcStats(
        npcLevel,
        npcClass,
        difficulty,
        statMultiplier,
        npcType,
      );
      const baseDmg = npc.damage;
      const dmg = combatService.calculateNpcDamage(
        baseDmg,
        damageKind,
        playerClass,
        totalArmor,
      );

      const hpRatio =
        npcMaxHpRef.current > 0 ? npcHpRef.current / npcMaxHpRef.current : 1;
      const { finalDmg, dmgType } = rollNpcDamage(
        dmg,
        hpRatio,
        npcType,
        npcPhase,
        player.character,
      );

      const scaledDmg = atLeastMinDamage(finalDmg * multiplier);

      applyNpcDamage(scaledDmg, tx, ty, dmgType);
      onDamageTakenRef?.current?.(scaledDmg);
      onHalfHeal?.();
      timeRef.current = applyHitstop(timeRef.current, 50);

      applyBleed(npcType, tenacityReductionRef.current, setPlayer);

      if (!skipCooldown) {
        npcCooldown.current = false;
        setTimeout(
          () => (npcCooldown.current = true),
          scaleCooldown(npcTime(), NPC_MELEE_COOLDOWN),
        );
      }
    },
    [
      luckBonus,
      isEnding,
      npcCooldown,
      npcTime,
      player.state,
      player.character,
      npcLevel,
      npcClass,
      playerClass,
      totalArmor,
      playerX,
      playerY,
      npcX,
      difficulty,
      timeRef,
      applyNpcDamage,
      setPlayer,
      titleEnemyMissChance,
      onDamageTakenRef,
      onDodgeRef,
      onHalfHeal,
      spawnDamageRef,
      npcType,
      npcPhase,
      statMultiplier,
      npcHpRef,
      npcMaxHpRef,
      tenacityReductionRef,
    ],
  );

  const npcRangedHit = useCallback(
    (damageKind: DamageKind = "physical") => {
      if (isEnding.current) return;
      if (ALL_PREDICATES.isInvulnerable(player.state)) return;
      if (!npcCooldown.current) return;
      if (ALL_PREDICATES.isDashing(player.state)) return;
      // Sem checagem de agachamento aqui: este callback só é alcançado pelo
      // pipeline de projétil (`onProjectileHit` ← `useProjectile`), e cada
      // handler já decidiu se o agachamento desvia — é lá que mora a elevação
      // do projétil (`gameRules/npc/projectile/crouchDodge`). Repetir a regra
      // aqui desfazia tanto o projétil terrestre quanto o
      // `canCrouchDodge: false` declarado no dado.

      const npc = getNpcStats(
        npcLevel,
        npcClass,
        difficulty,
        statMultiplier,
        npcType,
      );
      const baseDmg = npc.damage;
      const dmg = combatService.calculateNpcDamage(
        baseDmg,
        damageKind,
        playerClass,
        totalArmor,
      );

      const blocked = checkBlocked({
        dmg,
        character: player.character,
        playerState: player.state,
        playerBattleDirection: player.battleDirection,
        playerX,
        playerY,
        npcX,
        npcY,
        blockGauge,
        setBlockGauge,
        damagePlayerWithReflect,
        setPlayer,
        spawnDamageRef,
        timeRef,
        npcStaggerRef,
        npcCooldown,
        lastBlockPressRef,
        lastAttackPressRef,
        onFullBlock,
        onBlockRef,
      });
      if (blocked) return;

      const hpRatio =
        npcMaxHpRef.current > 0 ? npcHpRef.current / npcMaxHpRef.current : 1;
      const { finalDmg, dmgType } = rollNpcDamage(
        dmg,
        hpRatio,
        npcType,
        npcPhase,
        player.character,
      );

      damagePlayerWithReflect(finalDmg);
      navigator.vibrate?.(40);
      spawnDamageRef.current?.(finalDmg, playerX, playerY, dmgType);
      onHalfHeal?.();
      timeRef.current = applyHitstop(timeRef.current, 30);

      if (npcType === "maurao") {
        applyBleed(npcType, tenacityReductionRef.current, setPlayer);
      }

      npcCooldown.current = false;
      setTimeout(() => (npcCooldown.current = true), NPC_MELEE_COOLDOWN);
    },
    [
      isEnding,
      npcCooldown,
      player.state,
      player.battleDirection,
      player.character,
      npcLevel,
      npcClass,
      playerClass,
      totalArmor,
      setPlayer,
      playerX,
      playerY,
      npcX,
      npcY,
      difficulty,
      spawnDamageRef,
      timeRef,
      npcStaggerRef,
      blockGauge,
      setBlockGauge,
      lastBlockPressRef,
      lastAttackPressRef,
      damagePlayerWithReflect,
      onFullBlock,
      onHalfHeal,
      npcType,
      npcPhase,
      onBlockRef,
      statMultiplier,
      npcHpRef,
      npcMaxHpRef,
      tenacityReductionRef,
    ],
  );

  const npcFixedHit = useCallback(
    (dmg: number) => {
      if (isEnding.current) return;
      if (ALL_PREDICATES.isInvulnerable(player.state)) return;

      if (isParryPress(lastBlockPressRef, lastAttackPressRef)) {
        const parried = handleNpcBlocking({
          dmg,
          isBlocking: false,
          blockGauge,
          setBlockGauge,
          damagePlayerWithReflect,
          setPlayer,
          spawnDamageRef,
          playerX,
          playerY,
          attackerX: npcX,
          timeRef,
          npcStaggerRef,
          npcCooldown,
          lastBlockPressRef,
          lastAttackPressRef,
          onFullBlock,
          onBlockRef,
          onParry,
        });
        if (parried) return;
      }

      if (player.state !== "blocked") {
        damagePlayerWithReflect(dmg);
        spawnDamageRef.current?.(dmg, playerX, playerY, "npc");
        return;
      }

      handleNpcBlocking({
        dmg,
        isBlocking: true,
        blockGauge,
        setBlockGauge,
        damagePlayerWithReflect,
        setPlayer,
        spawnDamageRef,
        playerX,
        playerY,
        attackerX: npcX,
        timeRef,
        npcStaggerRef,
        npcCooldown,
        lastBlockPressRef,
        lastAttackPressRef,
        onFullBlock,
        onBlockRef,
        onParry,
      });
    },
    [
      isEnding,
      player.state,
      blockGauge,
      setBlockGauge,
      damagePlayerWithReflect,
      setPlayer,
      spawnDamageRef,
      playerX,
      playerY,
      npcX,
      timeRef,
      npcStaggerRef,
      npcCooldown,
      lastBlockPressRef,
      lastAttackPressRef,
      onFullBlock,
      onBlockRef,
      onParry,
    ],
  );

  const npcThrowHit = useCallback(
    (multiplier: number = 1, damageKind: DamageKind = "physical") => {
      if (isEnding.current) return;
      if (ALL_PREDICATES.isInvulnerable(player.state)) return;

      const npc = getNpcStats(
        npcLevel,
        npcClass,
        difficulty,
        statMultiplier,
        npcType,
      );
      const baseDmg = npc.damage;
      const dmg = combatService.calculateNpcDamage(
        baseDmg,
        damageKind,
        playerClass,
        totalArmor,
      );
      // Mesmo funil do melee: arremessar não pode fugir da tabela elemental
      // do NPC, da coluna certa de armadura nem da resistência do player.
      const finalDmg = atLeastMinDamage(
        dmg * multiplier * getNpcVsPlayerMultiplier(npcType, player.character),
      );

      damagePlayerWithReflect(finalDmg);
      spawnDamageRef.current?.(finalDmg, playerX, playerY, "npc");
      timeRef.current = applyHitstop(timeRef.current, 80);
      navigator.vibrate?.(80);
    },
    [
      isEnding,
      player.state,
      npcLevel,
      npcClass,
      playerClass,
      totalArmor,
      difficulty,
      damagePlayerWithReflect,
      spawnDamageRef,
      playerX,
      playerY,
      timeRef,
      statMultiplier,
      player.character,
      npcType,
    ],
  );

  /**
   * Dano inbloqueável: o bloqueio normal não reduz nada, mas um parry
   * (bloqueio pressionado 0-50ms antes do dano) evita todo o dano.
   */
  const npcUnblockableHit = useCallback(
    (dmg: number) => {
      if (isEnding.current) return;
      if (ALL_PREDICATES.isInvulnerable(player.state)) return;

      if (isParryPress(lastBlockPressRef, lastAttackPressRef)) {
        handleNpcBlocking({
          dmg,
          isBlocking: false,
          blockGauge,
          setBlockGauge,
          damagePlayerWithReflect,
          setPlayer,
          spawnDamageRef,
          playerX,
          playerY,
          attackerX: npcX,
          timeRef,
          npcStaggerRef,
          npcCooldown,
          lastBlockPressRef,
          lastAttackPressRef,
          onFullBlock,
          onBlockRef,
          onParry,
        });
        return;
      }

      damagePlayerWithReflect(dmg);
      spawnDamageRef.current?.(dmg, playerX, playerY, "npc");
      timeRef.current = applyHitstop(timeRef.current, 80);
      navigator.vibrate?.(80);
    },
    [
      isEnding,
      player.state,
      blockGauge,
      setBlockGauge,
      damagePlayerWithReflect,
      setPlayer,
      spawnDamageRef,
      playerX,
      playerY,
      npcX,
      timeRef,
      npcStaggerRef,
      npcCooldown,
      lastBlockPressRef,
      lastAttackPressRef,
      onFullBlock,
      onBlockRef,
      onParry,
    ],
  );

  // Hit da burst do hungryKing (fase 2): 10% do dano base do NPC aplicado como
  // dano + empurra o jogador 50px em x (direção da burst) e 50px em y (a
  // gravidade derruba com animação falling.svg). O dodge/agachamento já é
  // tratado no projétil (useProjectile).
  const npcBurstHit = useCallback(
    (pushDir: number) => {
      if (isEnding.current) return;
      if (ALL_PREDICATES.isNpcUnhittable(player.state)) return;

      const npc = getNpcStats(
        npcLevel,
        npcClass,
        difficulty,
        statMultiplier,
        npcType,
      );
      const burstDmg = Math.max(1, Math.round(npc.damage * 0.1));

      applyNpcDamage(burstDmg, playerX, playerY, "npc");
      playSound("explosion");
      logPlay("explosion");
      timeRef.current = applyHitstop(timeRef.current, 50);
      navigator.vibrate?.(80);

      setPlayer((p) => {
        if (p.mode !== "battle") return p;
        const newX = clampX(p.x + pushDir * 50);
        return {
          ...p,
          x: newX,
          y: Math.max(0, p.y - 50),
          velY: 0,
          state: "falling",
        };
      });
    },
    [
      isEnding,
      player.state,
      npcLevel,
      npcClass,
      npcType,
      difficulty,
      statMultiplier,
      playerX,
      playerY,
      applyNpcDamage,
      playSound,
      timeRef,
      setPlayer,
    ],
  );

  return {
    npcMeleeHit,
    npcRangedHit,
    npcBurstHit,
    npcThrowHit,
    npcFixedHit,
    npcUnblockableHit,
  };
}
