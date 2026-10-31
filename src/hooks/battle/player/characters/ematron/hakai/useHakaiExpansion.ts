import { useCallback, useEffect, useRef, useState } from "react";

import { useLatestRef } from "@/hooks/useLatestRef";
import { applyTime, clearTime } from "@/gameRules/battle/time";
import { ALL_TIME_KINDS } from "@/gameRules/battle/time/types";
import { useSkillGuard } from "@/hooks/battle/player/characters/useSkillGuard";
import type { EmatronCloneVisual } from "@/utils/types/character/ematron";
import type { HakaiApi, HakaiProps } from "./types";


export function useHakaiExpansion({
  player,
  setPlayer,
  npc,
  setNpcHP,
  spawnDamageNumber,
  freezeActionsUntilRef,
  startSpecialIntro,
  timeRef,
  isPausedRef,
  battleEndedRef,
  disabledRef,
  playSound,
  charges,
  chargesMax,
  setDelicia,
}: HakaiProps): HakaiApi {
  const [active, setActive] = useState(false);
  const [hakai, setHakai] = useState(false);
  const [cloneVisual, setCloneVisual] = useState<EmatronCloneVisual | null>(null);
  const activeRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const npcRef = useLatestRef(npc);
  const setNpcHPRef = useLatestRef(setNpcHP);
  const spawnDamageRef = useLatestRef(spawnDamageNumber);
  const playSoundRef = useLatestRef(playSound);
  const setDeliciaRef = useLatestRef(setDelicia);
  const chargesRef = useLatestRef(charges);
  const chargesMaxRef = useLatestRef(chargesMax);
  const teleportTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const distance = 60;
  
  const { usableRef } = useSkillGuard({
    player,
    character: "ematron",
    freezeActionsUntilRef,
    disabledRef,
    isPausedRef,
    battleEndedRef,
    extraCanUse: () => chargesRef.current >= chargesMaxRef.current && !activeRef.current,
    extraCancel: () => !activeRef.current,
  });

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (teleportTimeoutRef.current) {
      clearTimeout(teleportTimeoutRef.current);
      teleportTimeoutRef.current = null;
    }
  }, []);

  const press = useCallback(() => {
    if (activeRef.current) return;
    if (!usableRef.current) return;
    if (chargesRef.current < chargesMaxRef.current) return;

    setDeliciaRef.current(0);

    // Congela todas as entidades durante a intro e a habilidade.
    freezeActionsUntilRef.current = Infinity;

    const activate = () => {
      activeRef.current = true;
      setActive(true);
      const n = npcRef.current;
      // 1) Sprite de teleporte + sombra (EmatronClone) atrás do inimigo.
      setPlayer((p) => (p.mode !== "battle" ? p : { ...p, state: "ability" }));
      setCloneVisual({ x: n.x > player.x ? n.x + distance : n.x - distance, y: n.y, direction: n.x > player.x ? "left" : "right" });
      freezeActionsUntilRef.current = Date.now() + 4000;
      timeRef.current = applyTime(timeRef.current ?? [], { id: "hakai", kinds: ALL_TIME_KINDS, exempt: [], speed: 0, cooldown: Infinity, durationMs: 4000 });
      playSoundRef.current("ematronTeleport");
      // 2) Após 500ms, teleporta para a sombra e troca para hakai.svg; inicia dano.
      teleportTimeoutRef.current = setTimeout(() => {
        teleportTimeoutRef.current = null;
        setCloneVisual(null);

        setHakai(true);

        setPlayer((p) => {
          if (p.mode !== "battle") return p;

          const isNpcToRight = n.x > p.x;

          return {
            ...p,
            x: isNpcToRight ? n.x + distance : n.x - distance,
            velY: 0,
            state: "domainExpansion" as PlayerState,
            battleDirection: isNpcToRight ? "left" : "right",
          };
        });

        timerRef.current = setInterval(() => {
          if (isPausedRef.current) return;

          setNpcHPRef.current((hp) => {
            const next = Math.max(0, hp - 1);
            spawnDamageRef.current(1, n.x, n.y, "true" as DamageType);
            return next;
          });
        }, 10);
      }, 500);
      timeoutRef.current = setTimeout(() => {
        clear();
        activeRef.current = false;
        setActive(false);
        setHakai(false);
        freezeActionsUntilRef.current = Date.now();
        timeRef.current = clearTime(timeRef.current ?? [], "hakai");
        setPlayer((p) => (p.mode !== "battle" ? p : { ...p, state: "idle" }));
      }, 4000);
    };

    const started = startSpecialIntro("ematron", activate, "domainExpansion");
    if (!started) activate();
  }, [
    clear,
    freezeActionsUntilRef,
    isPausedRef,
    npcRef,
    playSoundRef,
    setDeliciaRef,
    setNpcHPRef,
    setPlayer,
    spawnDamageRef,
    usableRef,
    chargesMaxRef,
    chargesRef,
    player.x,
    startSpecialIntro,
    timeRef
  ]);

  useEffect(() => () => clear(), [clear]);

  return { active, shattering: false, press, usable: usableRef.current, cloneVisual, hakai };
}