import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useAudio } from "@/hooks/audio/useAudio";
import { useLatestRef } from "@/hooks/useLatestRef";
import { createSounds } from "@/utils/soundEffects";
import type { SoundId } from "@/utils/audio/soundId";

type SoundEffectsContextType = {
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  stopSound: (sound: SoundId) => void;
  stopAll: () => void;
};

const SoundEffectsContext = createContext<SoundEffectsContextType | null>(null);

const SOUND_VOLUMES: Partial<Record<SoundId, number>> = {
  boom: 1.3,
  slimitaJump: 0.3,
  impact: 0.5,
  natsukiSpecial: 1.3,
  riquelmeDomain: 1.3,
  marshadowSpecial: 0.7,
  mugetsu: 2,
  win: 0.5,
};

export function SoundEffectsProvider({ children }: { children: ReactNode }) {
  const { sfxVolume } = useAudio();
  const sfxVolumeRef = useLatestRef(sfxVolume);

  const soundsRef = useRef<Record<SoundId, HTMLAudioElement>>(
    {} as Record<SoundId, HTMLAudioElement>,
  );

  useEffect(() => {
    soundsRef.current = createSounds();

    Object.values(soundsRef.current).forEach((audio) => {
      audio.preload = "none";
    });

    return () => {
      Object.values(soundsRef.current).forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
    };
  }, []);

  useEffect(() => {
    const vol = Number.isFinite(sfxVolume) ? sfxVolume / 100 : 0.5;
    Object.values(soundsRef.current).forEach((audio) => {
      audio.volume = vol;
    });
  }, [sfxVolume]);

  const playSound = useCallback(
    async (sound: SoundId, loop?: boolean, volumeOverride?: number) => {
      const audio = soundsRef.current[sound];

      if (!audio) return;

      try {
        audio.pause();
        audio.currentTime = 0;
        audio.loop = loop ?? false;
        audio.volume =
          (sfxVolumeRef.current / 100) *
          (SOUND_VOLUMES[sound] ?? 1) *
          (volumeOverride ?? 1);

        await audio.play();
      } catch {
        // AbortError é esperado quando play() é interrompido por pause()
      }
    },
    [sfxVolumeRef],
  );

  const stopSound = useCallback((sound: SoundId) => {
    const audio = soundsRef.current[sound];

    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
  }, []);

  const stopAll = useCallback(() => {
    Object.values(soundsRef.current).forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  const value = useMemo(
    () => ({ playSound, stopSound, stopAll }),
    [playSound, stopSound, stopAll],
  );

  return (
    <SoundEffectsContext.Provider value={value}>
      {children}
    </SoundEffectsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSoundEffects(): SoundEffectsContextType {
  const context = useContext(SoundEffectsContext);

  return (
    context ?? {
      playSound: () => {},
      stopSound: () => {},
      stopAll: () => {},
    }
  );
}
