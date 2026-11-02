import type { Props } from "./types";
import { useState, useRef, useEffect } from "react";
import { useChargeParticles } from "@/hooks/battle/charge/useParticles";
import { useChargeDash } from "@/hooks/battle/charge/dash/useDash";
import { CHARGE_TIME } from "@/data/battle/charge";

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
  }

  function cancelCharge() {
    if (!isHoldingRef.current) return;
    particlesHook.stop();
    stopSound("chargingAttack");
    logStop("chargingAttack");
    isHoldingRef.current = false;
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
      dashHook.execute(player);
      isHoldingRef.current = false;
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
