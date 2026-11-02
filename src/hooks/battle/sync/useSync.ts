import type { SyncProps } from "./types";
import { useEffect } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";


export function useBattleSync({
  battle,
  npcAiHpRef,
  npc,
  updateNpcPosition,
  npcType,
  npcMaxHpRef,
  setNpcHPRef,
  isEndingRef,
  isPausedRef,
  resetBattleNavbarRef,
  setNpcPhase,
  setModeRef,
  closeInventoryRef,
  closeNavbarRef,
  refs,
  charge,
  player,
  halfHealReduction,
  battleNpcRangedHit,
  battleNpcMeleeHit,
  battleNpcBurstHit,
  battleNpcThrowHit,
}: SyncProps) {
  // NPC HP sync — lets AI behaviors read current NPC HP
  useEffect(() => {
    npcAiHpRef.current = battle.npcHP;
  }, [battle.npcHP, npcAiHpRef]);

  // Sync summon position to NPC position
  useEffect(() => {
    updateNpcPosition(npc.x);
  }, [npc.x, updateNpcPosition]);

  // Sync NPC phase state
  useEffect(() => {
    setNpcPhase(battle.npcPhase);
  }, [battle.npcPhase, setNpcPhase]);

  // Boss regen: hungryKing heals 1 HP/s in phase 2
  const halfHealUntilRef = useLatestRef(player.halfHealUntil);

  useEffect(() => {
    if (npcType !== "hungryKing") return;
    if (battle.npcPhase !== 2) return;

    const interval = setInterval(() => {
      if (isEndingRef.current.current) return;
      if (isPausedRef.current) return;
      const halfHealActive = halfHealUntilRef.current > Date.now();
      const heal = halfHealActive
        ? Math.max(0, Math.round(1 * (1 - halfHealReduction / 100)))
        : 1;
      if (heal <= 0) return;
      setNpcHPRef.current((hp: number) =>
        Math.min(npcMaxHpRef.current, hp + heal),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [
    npcType,
    battle.npcPhase,
    isEndingRef,
    isPausedRef,
    setNpcHPRef,
    npcMaxHpRef,
    halfHealReduction,
    halfHealUntilRef,
  ]);

  // Wire ref callbacks so battle system can trigger NPC ranged/melee hit
  refs.npcRangedAttackRef.current = (damageKind) => {
    if (player.state === "charging") charge.cancelCharge();
    battleNpcRangedHit(damageKind);
  };
  refs.npcMeleeAttackRef.current = (multiplier, damageKind) => {
    if (player.state === "charging") charge.cancelCharge();
    battleNpcMeleeHit(multiplier, damageKind);
  };
  refs.npcBurstAttackRef.current = (pushDir: number) => {
    if (player.state === "charging") charge.cancelCharge();
    battleNpcBurstHit(pushDir);
  };
  refs.npcThrowAttackRef.current = () => {
    battleNpcThrowHit(1.5);
  };

  // Set battle mode and close overlays on mount
  useEffect(() => {
    closeInventoryRef.current();
    closeNavbarRef.current();
    resetBattleNavbarRef.current();
    // setMode(battle) por último: closeNavbar/restoreMode (navbar de exploração
    // aberta ao entrar na batalha) não podem sobrescrever o mode da luta.
    setModeRef.current("battle");
  }, [setModeRef, closeInventoryRef, closeNavbarRef, resetBattleNavbarRef]);

  // Safety: fecha a BattleNavbar ao desmontar (sem restaurar modo).
  useEffect(() => {
    const cleanup = resetBattleNavbarRef.current;
    return () => cleanup();
  }, [resetBattleNavbarRef]);
}
