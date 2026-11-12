import type { Props } from "./types";
import { useState, useRef, useEffect } from "react";
import { useChargeParticles } from "@/hooks/battle/charge/useParticles";
import { useChargeDash } from "@/hooks/battle/charge/dash/useDash";
import { CHARGE_TIME } from "@/data/battle/charge";
import {
  YVEL_CHARGE_FREEZE_MAX_MS,
  YVEL_CHARGE_FREEZE_TIME_ID,
  pickUsefulYvelWeapon,
} from "@/data/characters/yvel/yvelWeapons";
import { applyTime, clearTime, freezeWorldSpec } from "@/gameRules/battle/time";

import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { logPlay, logStop } from "@/utils/replay/audioEventLog";
import {
  isPlayerFrozen,
  isPlayerParalyzed,
} from "@/gameRules/battle/status/statusEffects";

export function useChargeAttack(props: Props) {
  const {
    player,
    npcX,
    npcY,
    npcType,
    npcArmor,
    npcClass,
    char,
    playerClass,
    critRate,
    titleDamageBonus,
    elementDamageBonus,
    setNpcHP,
    playerCooldown,
    isEnding,
    timeRef,
    spawnDamageRef,
    registerHitRef,
    setPlayerState,
    setPlayer,
    summons,
    setSummons,
    setDelicia,
    hitsToSpecial,
    setPlayerHP,
    playerHP,
    playerMaxHp,
    vampirism,
    weapon,
    equipWeapon,
    vastolordMultiplierRef,
  } = props;

  const { playSound, stopSound } = useSoundEffects();

  const particlesHook = useChargeParticles();
  const dashHook = useChargeDash({
    player,
    npcX,
    npcY,
    npcType,
    npcArmor,
    npcClass,
    char,
    playerClass,
    critRate,
    titleDamageBonus,
    elementDamageBonus,
    setNpcHP,
    playerCooldown,
    timeRef,
    spawnDamageRef,
    registerHitRef,
    setPlayer,
    setPlayerState,
    summons,
    setSummons,
    setDelicia,
    hitsToSpecial,
    setPlayerHP,
    playerHP,
    playerMaxHp,
    vampirism,
    weapon,
    vastolordMultiplierRef,
  });

  /**
   * Carga do yvel (issue #217): enquanto ele carrega, o mundo inteiro congela
   * pela regra de time (NPC, summons, projéteis...) — o player segue livre
   * porque não é `TimeKind`. Soltar, cancelar ou desmontar sempre limpa o
   * efeito; o teto `YVEL_CHARGE_FREEZE_MAX_MS` cobre o caso de segurar
   * indefinidamente.
   */
  const freezesWorld = player.character === "yvel";

  function unfreezeWorld() {
    if (!freezesWorld) return;
    timeRef.current = clearTime(timeRef.current, YVEL_CHARGE_FREEZE_TIME_ID);
  }

  const chargeStartRef = useRef(0);
  const isHoldingRef = useRef(false);

  function startCharge() {
    if (isEnding.current) return;
    if (!playerCooldown.current) return;
    if (isHoldingRef.current) return;
    if (isPlayerFrozen(player) || isPlayerParalyzed(player)) return;

    isHoldingRef.current = true;
    chargeStartRef.current = Date.now();
    particlesHook.start();
    playSound("chargingAttack", true);
    logPlay("chargingAttack", true);
    setPlayerState("charging");
    if (freezesWorld) {
      timeRef.current = applyTime(
        timeRef.current,
        freezeWorldSpec(YVEL_CHARGE_FREEZE_TIME_ID, YVEL_CHARGE_FREEZE_MAX_MS),
      );
    }
  }

  function cancelCharge() {
    if (!isHoldingRef.current) return;
    particlesHook.stop();
    stopSound("chargingAttack");
    logStop("chargingAttack");
    isHoldingRef.current = false;
    unfreezeWorld();
    setPlayerState("idle");
  }

  function releaseCharge() {
    if (!isHoldingRef.current) return;

    const elapsed = Date.now() - chargeStartRef.current;

    if (elapsed >= CHARGE_TIME) {
      particlesHook.stop();
      stopSound("chargingAttack");
      logStop("chargingAttack");
      playSound("chargeAttack");
      logPlay("chargeAttack");
      unfreezeWorld();
      dashHook.execute(player);
      isHoldingRef.current = false;
      if (weapon && equipWeapon) {
        equipWeapon(
          pickUsefulYvelWeapon(
            Math.hypot(npcX - player.x, npcY - player.y),
            weapon,
          ),
        );
      }
    } else {
      cancelCharge();
    }
  }

  const [chargeProgress, setChargeProgress] = useState(0);

  useEffect(() => {
    if (!particlesHook.isCharging) {
      setChargeProgress(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - chargeStartRef.current;
      setChargeProgress(Math.min(1, elapsed / CHARGE_TIME));
    }, 50);

    return () => clearInterval(interval);
  }, [particlesHook.isCharging]);

  return {
    isCharging: particlesHook.isCharging,
    chargeReady: particlesHook.chargeReady,
    particles: particlesHook.particles,
    chargeProgress,
    startCharge,
    releaseCharge,
    cancelCharge,
  };
}
