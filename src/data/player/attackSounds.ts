import { charactersSoundPath } from "@/utils/paths/song/charactersSoundPath";

type AttackSoundConfig = {
  volume: number;
  /** Elementos de áudio pré-resolvidos (singleton por arquivo). */
  sounds: HTMLAudioElement[];
};

export const ATTACK_SOUNDS: Partial<
  Record<Player["character"], AttackSoundConfig>
> = {
  eduarda: {
    volume: 0.2,
    sounds: [charactersSoundPath("eduarda/normalAttack.mp3")],
  },

  marcelo: {
    volume: 0.2,
    sounds: [
      charactersSoundPath("marcelo/sword-slash-1.mp3"),
      charactersSoundPath("marcelo/sword-slash-2.mp3"),
      charactersSoundPath("marcelo/sword-slash-4.mp3"),
    ],
  },

  lucaua: {
    volume: 1,
    sounds: [charactersSoundPath("lucaua/shot.mp3")],
  },

  artur: {
    volume: 1,
    sounds: [charactersSoundPath("artur/ORA!.mp3")],
  },
};
