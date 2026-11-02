import type { Props } from "./types";
import { useRef, useCallback, useState, useEffect } from "react";
import type { ReplayFrame, ReplayData } from "@/utils/types/replay";
import { initAudioLog, getAudioEvents } from "@/utils/replay/audioEventLog";
import { buildFrame } from "@/hooks/battle/recording/buildFrame";

export function useBattleRecording({
  playerRef,
  npcRef,
  battleRef,
  damageNumbersRef,
  summonsRef,
  petRef,
  comboRef,
  comboActionRef,
  npcType,
  npcLevel,
  npcClass,
  playerCharacter,
  playerLevel,
  background,
  audioSrc,
}: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const framesRef = useRef<ReplayFrame[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimestampRef = useRef(0);
  const metadataRef = useRef<Omit<
    ReplayData,
    "id" | "frames" | "audioEvents"
  > | null>(null);

  const stopRecording = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    if (isRecording) return;
    framesRef.current = [];
    startTimestampRef.current = Date.now();
    metadataRef.current = {
      npcType,
      npcLevel,
      npcClass,
      playerCharacter,
      playerLevel,
      background,
      audioSrc,
      date: new Date().toISOString(),
      duration: 0,
    };
    initAudioLog(startTimestampRef.current);
    setIsRecording(true);

    intervalRef.current = setInterval(() => {
      const p = playerRef.current;
      const n = npcRef.current;
      const b = battleRef.current;
      if (!p || !n || !b) return;

      const frame = buildFrame(
        {
          player: p,
          npc: n,
          battle: b,
          damageNumbers: damageNumbersRef.current ?? [],
          summons: summonsRef.current ?? [],
          pet: petRef.current,
          combo: comboRef.current,
          comboAction: comboActionRef.current,
        },
        Date.now() - startTimestampRef.current,
      );

      framesRef.current.push(frame);
    }, 100);
  }, [
    isRecording,
    npcType,
    npcLevel,
    npcClass,
    playerCharacter,
    playerLevel,
    background,
    audioSrc,
    playerRef,
    npcRef,
    battleRef,
    damageNumbersRef,
    summonsRef,
    petRef,
    comboRef,
    comboActionRef,
  ]);

  const getReplayData = useCallback((): ReplayData | null => {
    if (framesRef.current.length === 0) return null;
    const duration = framesRef.current[framesRef.current.length - 1]!.t;
    return {
      id: `replay_${Date.now()}`,
      ...metadataRef.current!,
      duration,
      frames: framesRef.current,
      audioEvents: getAudioEvents(),
    };
  }, []);

  const getReplayWindow = useCallback((windowMs: number): ReplayData | null => {
    if (framesRef.current.length === 0 || !metadataRef.current) return null;
    const frames = framesRef.current;
    const last = frames[frames.length - 1]!.t;
    const startT = last - windowMs;
    const windowFrames = frames.filter((f) => f.t >= startT);
    if (windowFrames.length === 0) return null;
    return {
      id: `rewind_${Date.now()}`,
      ...metadataRef.current,
      duration: windowMs,
      frames: windowFrames,
      audioEvents: [],
    };
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    getReplayData,
    getReplayWindow,
  };
}
