import { ATTACK_SOUNDS } from "@/data/player/attackSounds";
import { SFX_KEY } from "@/data/storageKeys";

/**
 * Grunhidos congelados pela pausa da batalha — retomados no fechamento do
 * menu. Set de elementos (não de personagem): o som que está tocando no
 * instante da pausa é o que importa, independentemente de quem o disparou.
 */
const pausedByPause = new Set<HTMLAudioElement>();

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

  // Religado durante a pausa: deixa de estar em `pausedByPause` — o playback
  // novo é o comportamento pós-unpause, sem ser "continuado" duas vezes.
  pausedByPause.delete(audio);

  const saved = localStorage.getItem(SFX_KEY);
  const sfxVolume = saved !== null ? Number(saved) : 50;

  audio.pause();
  audio.currentTime = 0;
  audio.volume = config.volume * (sfxVolume / 100);
  audio.play().catch(() => {});
}

/** Congela os grunhidos de ataque em curso (pausa da batalha). */
export function pauseAttackSounds() {
  for (const config of Object.values(ATTACK_SOUNDS)) {
    if (!config) continue;
    for (const audio of config.sounds) {
      if (audio.paused || audio.ended) continue;
      audio.pause();
      pausedByPause.add(audio);
    }
  }
}

/** Retoma exatamente o que `pauseAttackSounds` congelou. */
export function resumeAttackSounds() {
  pausedByPause.forEach((audio) => {
    // Se acabou ou foi religado durante o menu, deixa como está.
    if (audio.paused && !audio.ended) audio.play().catch(() => {});
  });
  pausedByPause.clear();
}
