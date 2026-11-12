import type { Props, BabidiBombDropApi } from "./types";
import { useCallback, useEffect, useRef, useState } from "react";

import { useLatestRef } from "@/hooks/useLatestRef";
import { useSkillGuard } from "@/hooks/battle/player/characters/skillGuard/useSkillGuard";
import {
  ABILITY_COOLDOWN_TICK_MS,
  useCooldownPauseTick,
} from "@/hooks/battle/utilities/useCooldowns";

import { applyCooldownReduction } from "@/gameRules/battle/cooldownReduction";
import { BabidiBombDropConstants } from "@/data/characters/babidi";
import type { BabidiBombDropVisual } from "@/utils/types/character/babidi";

/**
 * "Energia Dimensional" do babidi: pose `upAttack`, portal aéreo sobre o
 * inimigo principal, bomba caindo e explosão. A sequência é conduzida por
 * timers (300ms de pose, 200ms de portal, 500ms de queda e 200ms de explosão);
 * o dano é um special mágico de 1x no alvo principal.
 */
export function useBabidiBombDrop({
  player,
  setPlayer,
  npc,
  battleManaRef,
  freezeActionsUntilRef,
  isPausedRef,
  disabledRef,
  battleEndedRef,
  playSound,
  onHit,
  onUsed,
  cooldownReduction,
}: Props): BabidiBombDropApi {
  const [visual, setVisual] = useState<BabidiBombDropVisual | null>(null);
  const [remaining, setRemaining] = useState(0);
  const visualRef = useRef<BabidiBombDropVisual | null>(null);
  const readyAtRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const onHitRef = useLatestRef(onHit);
  const onUsedRef = useLatestRef(onUsed);
  const playSoundRef = useLatestRef(playSound);

  const cost = Math.ceil(
    (battleManaRef.current?.playerMaxMana ?? 0) *
      BabidiBombDropConstants.COST_RATIO,
  );

  const commitVisual = useCallback((next: BabidiBombDropVisual | null) => {
    visualRef.current = next;
    setVisual(next);
  }, []);

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) clearTimeout(timer);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  }, []);

  const { usable, usableRef, shouldCancelRef } = useSkillGuard({
    player,
    character: "babidi",
    freezeActionsUntilRef,
    disabledRef,
    isPausedRef,
    battleEndedRef,
    extraCanUse: () =>
      (battleManaRef.current?.playerMana ?? 0) >=
      Math.ceil(
        (battleManaRef.current?.playerMaxMana ?? 0) *
          BabidiBombDropConstants.COST_RATIO,
      ),
    extraUsable: () =>
      Date.now() >= readyAtRef.current && visualRef.current === null,
  });

  const press = useCallback(() => {
    if (!usableRef.current) return;
    if (visualRef.current !== null) return;
    if (Date.now() < readyAtRef.current) return;

    const mana = battleManaRef.current;
    if (!mana) return;
    const spend = Math.ceil(
      mana.playerMaxMana * BabidiBombDropConstants.COST_RATIO,
    );
    if (spend > 0 && !mana.consumeMana(spend)) return;

    const now = Date.now();
    const cooldownMs = applyCooldownReduction(
      BabidiBombDropConstants.COOLDOWN_MS,
      cooldownReduction,
    );
    readyAtRef.current = now + cooldownMs;
    setRemaining(cooldownMs / 1000);
    onUsedRef.current();

    clearTimers();
    const previousFreeze = freezeActionsUntilRef.current;
    const totalMs =
      BabidiBombDropConstants.WINDUP_MS +
      BabidiBombDropConstants.PORTAL_MS +
      BabidiBombDropConstants.FALL_MS +
      BabidiBombDropConstants.EXPLOSION_MS;
    const armedFreeze = Math.max(previousFreeze, now + totalMs);
    freezeActionsUntilRef.current = armedFreeze;

    const targetX = npc.x;
    const targetY = npc.y;
    const portalY = targetY - BabidiBombDropConstants.PORTAL_HEIGHT;
    const id = `babidi-bomb-${now}`;

    setPlayer((p) =>
      p.state === "idle" ? { ...p, state: "babidiPortalAttack" } : p,
    );

    const finish = () => {
      clearTimers();
      commitVisual(null);
      setPlayer((p) =>
        p.state === "babidiPortalAttack" ? { ...p, state: "idle" } : p,
      );
      if (freezeActionsUntilRef.current === armedFreeze) {
        freezeActionsUntilRef.current = previousFreeze;
      }
    };

    const startPortal = () => {
      if (shouldCancelRef.current()) {
        finish();
        return;
      }
      playSoundRef.current("portalTeleport");
      commitVisual({ id, phase: "portal", targetX, targetY, portalY });

      schedule(() => {
        if (shouldCancelRef.current()) {
          finish();
          return;
        }
        commitVisual({
          id,
          phase: "falling",
          targetX,
          targetY,
          portalY,
        });

        schedule(() => {
          if (shouldCancelRef.current()) {
            finish();
            return;
          }
          commitVisual({
            id,
            phase: "exploding",
            targetX,
            targetY,
            portalY,
          });
          playSoundRef.current("explosion", false, 0.3);
          onHitRef.current();

          schedule(finish, BabidiBombDropConstants.EXPLOSION_MS);
        }, BabidiBombDropConstants.FALL_MS);
      }, BabidiBombDropConstants.PORTAL_MS);
    };

    schedule(startPortal, BabidiBombDropConstants.WINDUP_MS);
  }, [
    usableRef,
    battleManaRef,
    cooldownReduction,
    onUsedRef,
    clearTimers,
    schedule,
    freezeActionsUntilRef,
    npc.x,
    npc.y,
    setPlayer,
    commitVisual,
    shouldCancelRef,
    playSoundRef,
    onHitRef,
  ]);

  const cooldownTick = useCooldownPauseTick({
    readyAtRef,
    isPausedRef,
  });

  useEffect(() => {
    const id = setInterval(() => {
      if (!cooldownTick()) return;
      const next = Math.max(0, (readyAtRef.current - Date.now()) / 1000);
      setRemaining((prev) => (prev === next ? prev : next));
    }, ABILITY_COOLDOWN_TICK_MS);
    return () => clearInterval(id);
  }, [cooldownTick]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return {
    visual,
    press,
    usable: usable && visual === null && remaining <= 0,
    remaining,
    cost,
  };
}
