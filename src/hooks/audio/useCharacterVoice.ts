import { useCallback, useEffect, useRef } from "react";
import { useAudio } from "@/hooks/audio/useAudio";
import { useLatestRef } from "@/hooks/useLatestRef";
import { soundEffectPath } from "@/utils/paths/song/soundEffectPath";
import type { CharacterId } from "@/data/characters/list";

/**
 * Nome do arquivo da fala de seleção dentro de
 * `songs/soundEffects/player/characters/<char>/`. Fica numa constante porque
 * é o contrato com quem produz o áudio: personagem sem esse arquivo
 * simplesmente fica mudo.
 */
export const CHARACTER_VOICE_FILE = "select.mp3";

/**
 * Caminho (com base URL) da fala de seleção de um personagem. Usa
 * `soundEffectPath` direto porque `charactersSoundPath` devolve um
 * `HTMLAudioElement` já criado, e aqui o elemento é reaproveitado.
 */
export function characterVoicePath(character: CharacterId): string {
  return soundEffectPath(
    `player/characters/${character}/${CHARACTER_VOICE_FILE}`,
  );
}

/**
 * Fala do personagem ao ser escolhido (estilo seleção de campeão do LoL).
 *
 * Usa um único `HTMLAudioElement` próprio em vez de registrar um `SoundId` por
 * personagem no `SoundEffectsContext`: o arquivo é opcional por personagem e
 * o `createSounds()` pré-registra tudo, o que forçaria um `SoundId` para áudio
 * que pode nem existir. Aqui o 404 só faz `play()` rejeitar — silêncio é o
 * comportamento esperado enquanto a fala não for gravada.
 *
 * Escolher outro personagem corta a fala anterior, para as vozes nunca
 * sobreporem quando o jogador troca rápido.
 */
export function useCharacterVoice(): (character: CharacterId) => void {
  const { sfxVolume } = useAudio();
  const sfxVolumeRef = useLatestRef(sfxVolume);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      audio.removeAttribute("src");
      audioRef.current = null;
    };
  }, []);

  return useCallback(
    (character: CharacterId) => {
      const audio = audioRef.current ?? new Audio();
      audioRef.current = audio;
      audio.pause();
      audio.src = characterVoicePath(character);
      const volume = Number.isFinite(sfxVolumeRef.current)
        ? sfxVolumeRef.current / 100
        : 0.5;
      audio.volume = Math.min(1, Math.max(0, volume));
      audio.play().catch(() => undefined);
    },
    [sfxVolumeRef],
  );
}
