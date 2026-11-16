import type { Props } from "./types";
import { useEffect, useRef } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { getCharacterPassive } from "@/data/characters/passives";
import {
  REWIND_RESURRECTION_PHASES,
  REWIND_RESURRECTION_PHASE_MS,
} from "@/data/characters/srGuaxinim/resurrection";
import {
  findRewindTarget,
  pruneRewindSnapshots,
  REWIND_BUFFER_MS,
  REWIND_INTERVAL_MS,
  type RewindSnap,
} from "@/gameRules/battle/rewind";
import type { RewindSnapshot } from "@/utils/types/battle/rewind";

/**
 * Passiva "Retrocesso Temporal": guarda snapshots da batalha e, na morte, volta
 * o estado inteiro para ~10s antes, uma vez por batalha.
 *
 * Desde a #284 a volta não é mais um replay frame a frame: a morte dispara a
 * cinemática `launch → portal → void → flash` (`rewindResurrection`), durante a
 * qual a batalha fica pausada pelo `isPaused` do `useScene` (ninguém age), e o
 * snapshot alvo é aplicado de uma vez quando o `flash` termina.
 */
export function useRewind({
  character,
  rewindResurrection,
  setRewindResurrection,
  performRewindRef,
  setPlayer,
  setNpcPhase,
  setSummons,
  playerSnapshotRef,
  npcSnapshotRef,
  battleSnapshotRef,
  npcProjectilesSnapshotRef,
  summonsSnapshotRef,
  battle,
  npc,
  resetCombo,
}: Props) {
  const rewindSnapshotsRef = useRef<RewindSnap[]>([]);
  const rewindUsedRef = useRef(false);
  const rewindTargetRef = useRef<RewindSnapshot | null>(null);

  const applyRewind = (target: RewindSnapshot) => {
    battle.setPlayerHP(target.playerHP);
    battle.setPlayerShield(target.playerShield);
    battle.setNpcHP(target.npcHP);
    setNpcPhase(target.npcPhase);
    battle.setDelicia(target.delicia);
    setPlayer((p) => ({
      ...p,
      x: target.playerX,
      y: target.playerY,
      state: target.playerState,
      battleDirection: target.playerBattleDirection,
      grabbedUntil: 0,
      pullFromX: 0,
      pullToX: 0,
      pullStartTime: 0,
      pullDuration: 300,
    }));
    npc.setNpc((n) => ({
      ...n,
      x: target.npcX,
      y: target.npcY,
      state: target.npcState,
      direction: target.npcDirection,
    }));
    npc.setProjectiles(target.projectiles);
    setSummons(target.summons);
    battle.isEnding.current = false;
    resetCombo();
  };

  const onRewindCompleteRef = useLatestRef(() => {
    if (rewindTargetRef.current) {
      applyRewind(rewindTargetRef.current);
    }
    rewindTargetRef.current = null;
    setRewindResurrection(null);
  });

  const phase = rewindResurrection?.phase ?? null;

  useEffect(() => {
    if (phase == null) return;
    const index = REWIND_RESURRECTION_PHASES.indexOf(phase);
    const next = REWIND_RESURRECTION_PHASES[index + 1];
    const timer = window.setTimeout(() => {
      if (next == null) {
        onRewindCompleteRef.current();
        return;
      }
      setRewindResurrection((r) => (r ? { ...r, phase: next } : r));
    }, REWIND_RESURRECTION_PHASE_MS[phase]);
    return () => window.clearTimeout(timer);
  }, [phase, setRewindResurrection, onRewindCompleteRef]);

  performRewindRef.current = () => {
    const passive = getCharacterPassive(character, "rewindTime");
    if (!passive) return false;
    if (rewindUsedRef.current) return false;
    const target = findRewindTarget(
      rewindSnapshotsRef.current,
      Date.now(),
      passive.effect.rewindMs,
    );
    if (!target) return false;

    rewindUsedRef.current = true;
    rewindTargetRef.current = target;
    battle.isEnding.current = true;

    const origin = playerSnapshotRef.current;
    const firstPhase = REWIND_RESURRECTION_PHASES[0];
    if (!origin || firstPhase == null) {
      applyRewind(target);
      rewindTargetRef.current = null;
      return true;
    }

    setRewindResurrection({
      phase: firstPhase,
      originX: origin.x,
      originY: origin.y,
      character,
    });
    return true;
  };

  useEffect(() => {
    rewindSnapshotsRef.current = [];
    rewindUsedRef.current = false;

    const interval = setInterval(() => {
      const p = playerSnapshotRef.current;
      const n = npcSnapshotRef.current;
      const b = battleSnapshotRef.current;
      if (!p || !n || !b) return;

      const snap: RewindSnapshot = {
        at: Date.now(),
        playerHP: b.playerHP,
        playerShield: b.playerShield,
        npcHP: b.npcHP,
        npcPhase: b.npcPhase,
        delicia: b.delicia,
        playerX: p.x,
        playerY: p.y,
        playerState: p.state,
        playerBattleDirection: p.battleDirection,
        npcX: n.x,
        npcY: n.y,
        npcState: n.state,
        npcDirection: n.direction,
        projectiles: [...(npcProjectilesSnapshotRef.current ?? [])],
        summons: summonsSnapshotRef.current ?? [],
      };
      rewindSnapshotsRef.current.push({ at: snap.at, snap });
      rewindSnapshotsRef.current = pruneRewindSnapshots(
        rewindSnapshotsRef.current,
        snap.at - REWIND_BUFFER_MS,
      );
    }, REWIND_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [
    playerSnapshotRef,
    npcSnapshotRef,
    battleSnapshotRef,
    npcProjectilesSnapshotRef,
    summonsSnapshotRef,
  ]);

  const reset = () => {
    rewindSnapshotsRef.current = [];
    rewindTargetRef.current = null;
    rewindUsedRef.current = false;
    setRewindResurrection(null);
  };

  return {
    reset,
  };
}
