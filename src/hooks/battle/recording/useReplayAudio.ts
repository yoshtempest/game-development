import { useCallback, useEffect, useRef } from "react";
import { resolveAsset } from "@/utils/paths";
import { useAudio } from "@/hooks/audio/useAudio";
import { useLatestRef } from "@/hooks/useLatestRef";
import { createSounds } from "@/utils/soundEffects";
import type { ReplayData } from "@/utils/types/replay";

const SFX_VOLUME: Record<string, number> = {
  boom: 1.3,
  slimitaJump: 0.3,
  atomic: 0.7,
  mugetsu: 2,
  hollowPurple: 1.3,
  natsukiOpenedDomain: 1.3,
  win: 0.5,
};

export function useReplayAudio(
  replay: ReplayData,
  playing: boolean,
  currentFrame: number,
) {
  const { bgmVolume } = useAudio();
  const bgmVolumeRef = useLatestRef(bgmVolume);

  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const bgmReadyRef = useRef(false);
  const soundsMapRef = useRef<Record<string, HTMLAudioElement>>(
    {} as Record<string, HTMLAudioElement>,
  );
  const lastEventIndexRef = useRef(0);
  const prevFiRef = useRef(0);

  const playingRef = useLatestRef(playing);

  useEffect(() => {
    const audio = new Audio(resolveAsset(replay.audioSrc));
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.5 * (bgmVolumeRef.current / 100);

    const onCanPlay = () => {
      bgmReadyRef.current = true;
      if (playingRef.current) {
        audio.play().catch(() => {});
      }
    };

    audio.addEventListener("canplaythrough", onCanPlay);
    audio.load();
    bgmRef.current = audio;

    return () => {
      audio.removeEventListener("canplaythrough", onCanPlay);
      audio.pause();
      audio.src = "";
      bgmRef.current = null;
      bgmReadyRef.current = false;
    };
  }, [replay.audioSrc, bgmVolumeRef, playingRef]);

  useEffect(() => {
    const audio = bgmRef.current;
    if (!audio) return;
    audio.volume = 0.5 * (bgmVolume / 100);
  }, [bgmVolume]);

  useEffect(() => {
    const audio = bgmRef.current;
    if (!audio || !bgmReadyRef.current) return;
    if (playing) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [playing]);

  const stopAllSfx = useCallback(() => {
    if (soundsMapRef.current) {
      Object.values(soundsMapRef.current).forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    }
  }, []);

  const processAudioEvents = useCallback(
    (fromTime: number, toTime: number) => {
      const events = replay.audioEvents;
      if (!events || events.length === 0) return;

      for (let i = lastEventIndexRef.current; i < events.length; i++) {
        const ev = events[i];
        if (!ev) continue;
        if (ev.t > toTime) break;
        if (ev.t < fromTime) {
          lastEventIndexRef.current = i + 1;
          continue;
        }

        const audio = soundsMapRef.current[ev.sound];
        if (!audio) {
          lastEventIndexRef.current = i + 1;
          continue;
        }

        if (ev.op === "play") {
          try {
            audio.pause();
            audio.currentTime = 0;
            audio.loop = ev.loop;
            audio.volume =
              (bgmVolumeRef.current / 100) * (SFX_VOLUME[ev.sound] ?? 1);
            audio.play().catch(() => {});
          } catch {
            // AbortError
          }
        } else if (ev.op === "stop") {
          audio.pause();
          audio.currentTime = 0;
        }

        lastEventIndexRef.current = i + 1;
      }
    },
    [replay.audioEvents, bgmVolumeRef],
  );

  useEffect(() => {
    const map = createSounds() as Record<string, HTMLAudioElement>;
    soundsMapRef.current = map;
    return () => {
      Object.values(map).forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
    };
  }, []);

  useEffect(() => {
    if (currentFrame === 0 && prevFiRef.current === 0) return;

    const prevFrame = replay.frames[prevFiRef.current];
    const curFrame = replay.frames[currentFrame];
    if (prevFrame && curFrame) {
      processAudioEvents(prevFrame.t, curFrame.t);
    }
    prevFiRef.current = currentFrame;
  }, [currentFrame, replay.frames, processAudioEvents]);

  const handleRestart = useCallback(() => {
    stopAllSfx();
    lastEventIndexRef.current = 0;
    prevFiRef.current = 0;
  }, [stopAllSfx]);

  const handleSeek = useCallback(
    (frame: number) => {
      stopAllSfx();
      lastEventIndexRef.current = 0;
      prevFiRef.current = frame;
    },
    [stopAllSfx],
  );

  return { handleRestart, handleSeek };
}
