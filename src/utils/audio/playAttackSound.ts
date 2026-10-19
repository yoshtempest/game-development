import { ATTACK_SOUNDS } from "@/data/player/attackSounds";
import { SFX_KEY } from "@/data/storageKeys";

/**
 * Toca um som de ataque aleatório do personagem.
 *
 * Os elementos já vêm prontos da tabela (`ATTACK_SOUNDS`, um singleton por
 * arquivo via `charactersSoundPath`): aqui só é preciso respeitar o volume
 * configurado e reiniciar o playback — sem pool local.
 */
export function playAttackSound(character: Player["character"]) {
  const config = ATTACK_SOUNDS[character];

  if (!config) return;

  const audio =
    config.sounds[Math.floor(Math.random() * config.sounds.length)] ?? null;

  if (!audio) return;

  const saved = localStorage.getItem(SFX_KEY);
  const sfxVolume = saved !== null ? Number(saved) : 50;

  audio.pause();
  audio.currentTime = 0;
  audio.volume = config.volume * (sfxVolume / 100);
  audio.play().catch(() => {});
}
