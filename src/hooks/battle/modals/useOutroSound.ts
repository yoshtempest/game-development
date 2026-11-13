import { useEffect } from "react";
import { useAudio } from "@/hooks/audio/useAudio";
import { getOpponentOutroResult } from "@/gameRules/battle/outro";
import { charactersSoundPath } from "@/utils/paths/song/charactersSoundPath";
import { npcSoundPath } from "@/utils/paths/song/npcSoundPath";
import type { BattleOutroResult } from "@/utils/types/battle/outro";

const OUTRO_SOUND_VOLUME = 1;

/** Personagem cujos `victory.mp3`/`defeat.mp3` cobrem quem não tem som próprio. */
const PLAYER_FALLBACK_CHARACTER = "srGuaxinim";

/**
 * Toca os efeitos sonoros de fim de batalha durante o outro: primeiro a fala
 * do personagem, depois a do NPC.
 *
 * - Player: `assets/songs/soundEffects/player/characters/<character>/<result>.mp3`.
 *   Sem arquivo na pasta do personagem, toca o do `srGuaxinim` **do mesmo
 *   resultado** — tocar `defeat.mp3` numa vitória contradiz o retrato.
 * - NPC: `assets/songs/soundEffects/npc/<npcType>/<resultDoNpc>.mp3`, com o
 *   resultado invertido (`getOpponentOutroResult`). NPC sem som fica em
 *   silêncio: não há fala genérica que sirva para qualquer criatura.
 *
 * As falas são sequenciais (a do NPC espera o `ended`/`error` da do player)
 * porque duas vozes ao mesmo tempo ficam ininteligíveis. O fallback só reage
 * ao evento `error` do elemento (falha real de carregamento/404); a rejeição
 * de `play()` vem de autoplay policy, interrupção ou cleanup e é ignorada.
 *
 * @param character Personagem do player.
 * @param type Resultado do ponto de vista do player.
 * @param npcType NPC enfrentado; ausente = só a fala do player.
 */
export function useBattleOutroSound(
  character: string,
  type: BattleOutroResult,
  npcType?: string,
) {
  const { sfxVolume } = useAudio();

  useEffect(() => {
    const volume = (sfxVolume / 100) * OUTRO_SOUND_VOLUME;
    const playerSrc = charactersSoundPath(`${character}/${type}.mp3`).src;
    const playerFallbackSrc = charactersSoundPath(
      `${PLAYER_FALLBACK_CHARACTER}/${type}.mp3`,
    ).src;
    const npcSrc = npcType
      ? npcSoundPath(`${npcType}/${getOpponentOutroResult(type)}.mp3`).src
      : null;

    const playerAudio = new Audio();
    playerAudio.preload = "auto";
    playerAudio.volume = volume;
    const npcAudio = new Audio();
    npcAudio.preload = "auto";
    npcAudio.volume = volume;

    let playerFallbackTriggered = false;
    let npcStarted = false;
    let disposed = false;

    const startNpc = () => {
      if (disposed || npcStarted || !npcSrc) return;
      npcStarted = true;
      npcAudio.src = npcSrc;
      npcAudio.play().catch(() => {});
    };

    const handlePlayerError = () => {
      if (playerFallbackTriggered || character === PLAYER_FALLBACK_CHARACTER) {
        startNpc();
        return;
      }
      playerFallbackTriggered = true;
      playerAudio.src = playerFallbackSrc;
      playerAudio.play().catch(() => {});
    };

    playerAudio.addEventListener("error", handlePlayerError);
    playerAudio.addEventListener("ended", startNpc);

    playerAudio.src = playerSrc;
    playerAudio.play().catch(() => {});

    return () => {
      disposed = true;
      playerAudio.removeEventListener("error", handlePlayerError);
      playerAudio.removeEventListener("ended", startNpc);
      playerAudio.pause();
      playerAudio.src = "";
      npcAudio.pause();
      npcAudio.src = "";
    };
  }, [character, type, npcType, sfxVolume]);
}
