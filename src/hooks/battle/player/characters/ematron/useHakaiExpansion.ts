import { useCallback, useEffect, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from "react";

import { useLatestRef } from "@/hooks/useLatestRef";
import type { TimeEffect } from "@/gameRules/battle/time";
import { useSkillGuard } from "@/hooks/battle/player/characters/useSkillGuard";
import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { SoundId } from "@/utils/audio/soundId";
import type { SummonedNpc } from "@/utils/types/npc/npc";

type Props = {
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  npc: { x: number; y: number };
  npcHP: number;
  npcMaxHp: number;
  setNpcHP: Dispatch<SetStateAction<number>>;
  summons: SummonedNpc[];
  setSummons: Dispatch<SetStateAction<SummonedNpc[]>>;
  spawnDamageNumber: (value: number, x: number, y: number, type: DamageType) => void;
  freezeActionsUntilRef: RefObject<number>;
  battleManaRef: RefObject<BattleManaApi | null>;
  timeRef: RefObject<TimeEffect[]>;
  isPausedRef: RefObject<boolean>;
  isMenuOpen: boolean;
  battleEndedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  charges: number;
  chargesMax: number;
  setDelicia: Dispatch<SetStateAction<number>>;
};

type HakaiApi = {
  active: boolean;
  shattering: boolean;
  press: () => void;
  usable: boolean;
};

export function useHakaiExpansion({
  player,
  setPlayer,
  npc,
  setNpcHP,
  spawnDamageNumber,
  freezeActionsUntilRef,
  isPausedRef,
  battleEndedRef,
  disabledRef,
  playSound,
  charges,
  chargesMax,
  setDelicia,
}: Props): HakaiApi {
  const [active, setActive] = useState(false);
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
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  }, []);

  const press = useCallback(() => {
    if (activeRef.current) return;
    if (!usableRef.current) return;
    if (chargesRef.current < chargesMaxRef.current) return;

    activeRef.current = true;
    setActive(true);
    setDeliciaRef.current(0);

    const n = npcRef.current;
    // teleport behind enemy
    setPlayer((p) => {
      if (p.mode !== "battle") return p;
      const behind = n.x > p.x ? n.x - 60 : n.x + 60;
      return { ...p, x: behind, y: p.y, groundY: p.groundY, velY: 0, state: "domainExpansion" as PlayerState, battleDirection: n.x > p.x ? "left" : "right" };
    });

    freezeActionsUntilRef.current = Date.now() + 2000;
    playSoundRef.current("ematronTeleport" as SoundId);

    // drain 1 hp every 2ms
    timerRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      setNpcHPRef.current((hp) => {
        const next = Math.max(0, hp - 1);
        spawnDamageRef.current(1, n.x, n.y, "true" as DamageType);
        return next;
      });
    }, 2);

    timeoutRef.current = setTimeout(() => {
      clear();
      activeRef.current = false;
      setActive(false);
      freezeActionsUntilRef.current = Date.now();
      setPlayer((p) => (p.mode !== "battle" ? p : { ...p, state: "idle" }));
    }, 2000);
  }, [clear, freezeActionsUntilRef, isPausedRef, npcRef, playSoundRef, setDeliciaRef, setNpcHPRef, setPlayer, spawnDamageRef, usableRef]);

  useEffect(() => () => clear(), [clear]);

  return { active, shattering: false, press, usable: usableRef.current };
}