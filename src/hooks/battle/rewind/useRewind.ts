import type { Props } from "./types";
import { useEffect, useRef } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { getCharacterPassive } from "@/data/characters/passives";
import {
  findRewindTarget,
  pruneRewindSnapshots,
  REWIND_BUFFER_MS,
  REWIND_INTERVAL_MS,
  REWIND_PLAYBACK_MS,
  type RewindSnap,
} from "@/gameRules/battle/rewind";
import type { RewindSnapshot } from "@/utils/types/battle/rewind";
import type { ReplayFrame } from "@/utils/types/replay";

export function useRewind({
  character,
  rewindFrames,
  setRewindFrames,
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
  getReplayWindow,
}: Props) {
  const rewindSnapshotsRef = useRef<RewindSnap[]>([]);
  const rewindUsedRef = useRef(false);
  const rewindTargetRef = useRef<RewindSnapshot | null>(null);
  const rewindIndexRef = useRef(0);

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

  const applyFrameToLive = (frame: ReplayFrame) => {
    setPlayer((p) => ({
      ...p,
      x: frame.px,
      y: frame.py,
      state: frame.ps,
      battleDirection: frame.pd,
    }));
    npc.setNpc((n) => ({
      ...n,
      x: frame.nx,
      y: frame.ny,
      state: frame.ns,
      direction: frame.ndir,
    }));
    battle.setPlayerHP(frame.php);
    battle.setPlayerShield(frame.pshield);
    battle.setNpcHP(frame.nhp);
    battle.setDelicia(frame.del);
    setSummons(
      frame.sm.map((s) => ({
        id: s.id,
        npcType: s.t,
        x: s.x,
        y: s.y,
        direction: s.dir,
        state: s.st,
        hp: s.hp,
        maxHp: s.hp,
        // O frame carrega a armadura resolvida no spawn: sem ela a criatura
        // voltaria do rewind sem defesa nenhuma.
        armor: s.armor,
        isDying: false,
      })),
    );
  };

  const onRewindCompleteRef = useLatestRef(() => {
    if (rewindTargetRef.current) {
      applyRewind(rewindTargetRef.current);
    }
    rewindTargetRef.current = null;
    setRewindFrames(null);
  });

  const applyFrameToLiveRef = useLatestRef(applyFrameToLive);

  useEffect(() => {
    if (!rewindFrames || rewindFrames.length === 0) return;
    rewindIndexRef.current = rewindFrames.length - 1;

    const interval = setInterval(() => {
      const idx = rewindIndexRef.current;
      const frame = rewindFrames[idx];
      if (frame) {
        applyFrameToLiveRef.current(frame);
        rewindIndexRef.current = idx - 1;
        if (idx <= 0) {
          clearInterval(interval);
          onRewindCompleteRef.current();
          return;
        }
      }
    }, REWIND_PLAYBACK_MS);

    return () => clearInterval(interval);
  }, [rewindFrames, applyFrameToLiveRef, onRewindCompleteRef]);

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

    const windowReplay = getReplayWindow(passive.effect.rewindMs);
    if (!windowReplay || windowReplay.frames.length === 0) {
      applyRewind(target);
      rewindTargetRef.current = null;
      return true;
    }

    setRewindFrames(windowReplay.frames);
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
    setRewindFrames(null);
  };

  return {
    reset,
  };
}
