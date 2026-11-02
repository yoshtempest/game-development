import type { Props } from "./types";
import { useEffect } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { FIFTY_MS } from "@/data/ms";
import {
  ENCHANTMENTS,
  ENCHANTMENT_TICK_DAMAGE,
  ENCHANTMENT_TICK_INTERVAL_MS,
  type Enchantment,
} from "@/data/equipment/enchantments";
import { DOT_TICK_INTERVAL_MS } from "@/gameRules/battle/status/statusEffects";
import { HONORED_ONE_REGEN_PER_SECOND } from "@/gameRules/battle/cursedEnergy";


export function useStatusDots({
  honoredRegenActive,
  battleManaRef,
  isEndingRef,
  isPausedRef,
  setSummons,
  summonsBleedUntilRef,
  summons,
  setNpcHP,
  npcX,
  npcY,
  spawnDamageRef,
  npcEnchantUntilRef,
}: Props) {
  const summonsRef = useLatestRef(summons);
  const setNpcHPRef = useLatestRef(setNpcHP);
  const npcSnapshotRef = useLatestRef({ x: npcX, y: npcY });

  /** Passiva O Abençoado: regenera energia amaldiçoada (10/s). */
  useEffect(() => {
    if (!honoredRegenActive) return;
    const mana = battleManaRef.current;
    if (!mana) return;
    const interval = setInterval(() => {
      if (isEndingRef.current.current || isPausedRef.current) {
        return;
      }
      battleManaRef.current?.restoreMana(HONORED_ONE_REGEN_PER_SECOND);
    }, FIFTY_MS);
    return () => clearInterval(interval);
  }, [honoredRegenActive, battleManaRef, isEndingRef, isPausedRef]);

  /** Dano contínuo de bleed nos summons (status aplicado por pet skill). */
  useEffect(() => {
    const interval = setInterval(() => {
      if (isEndingRef.current.current || isPausedRef.current) return;
      const bleedMap = summonsBleedUntilRef.current;
      if (!summonsRef.current.some((s) => (bleedMap[s.id] ?? 0) > Date.now())) {
        return;
      }

      const bleeding = summonsRef.current.filter(
        (s) => (bleedMap[s.id] ?? 0) > Date.now(),
      );
      setSummons((prev) =>
        prev.map((s) =>
          (bleedMap[s.id] ?? 0) > Date.now()
            ? { ...s, hp: Math.max(0, s.hp - 2) }
            : s,
        ),
      );
      for (const s of bleeding) {
        spawnDamageRef.current?.(2, s.x, s.y, "bleed");
      }

      const now = Date.now();
      for (const id of Object.keys(bleedMap)) {
        const until = bleedMap[id];
        if (until !== undefined && until <= now) delete bleedMap[id];
      }
    }, DOT_TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [
    setSummons,
    isEndingRef,
    isPausedRef,
    summonsRef,
    summonsBleedUntilRef,
    spawnDamageRef,
  ]);

  /**
   * Dano contínuo dos status aplicados pelo encantamento da arma.
   *
   * `freeze` não tem tick de dano: o efeito dele é manter o NPC parado, o que
   * já acontece via `npcStaggerRef`.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (isEndingRef.current.current || isPausedRef.current) return;

      const now = Date.now();
      let total = 0;
      let lastType: Enchantment | null = null;

      for (const enchantment of ENCHANTMENTS) {
        if (npcEnchantUntilRef.current[enchantment] <= now) continue;
        const tick = ENCHANTMENT_TICK_DAMAGE[enchantment];
        if (tick <= 0) continue;
        total += tick;
        lastType = enchantment;
      }

      if (total <= 0 || !lastType) return;

      setNpcHPRef.current((hp) => Math.max(0, hp - total));
      const snapshot = npcSnapshotRef.current;
      spawnDamageRef.current?.(total, snapshot.x, snapshot.y, lastType);
    }, ENCHANTMENT_TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [
    isEndingRef,
    isPausedRef,
    setNpcHPRef,
    spawnDamageRef,
    npcSnapshotRef,
    npcEnchantUntilRef,
  ]);
}
