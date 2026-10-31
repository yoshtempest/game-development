import { charactersSoundPath } from "@/utils/paths/song/charactersSoundPath";

type AttackSoundConfig = {
  volume: number;
  /** Elementos de áudio pré-resolvidos (singleton por arquivo). */
  sounds: HTMLAudioElement[];
};

export const ATTACK_SOUNDS: Partial<
  Record<Player["character"], AttackSoundConfig>
> = {
  drika: {
    volume: 0.2,
    sounds: [charactersSoundPath("drika/normalAttack.mp3")],
  },

  marshadow: {
    volume: 0.2,
    sounds: [
      charactersSoundPath("marshadow/sword-slash-1.mp3"),
      charactersSoundPath("marshadow/sword-slash-2.mp3"),
      charactersSoundPath("marshadow/sword-slash-4.mp3"),
    ],
  },

  babidi: {
    volume: 1,
    sounds: [
      charactersSoundPath("babidi/shot.mp3"),
      charactersSoundPath("babidi/missile.mp3"),
    ],
  },

  srGuaxinim: {
    volume: 1,
    sounds: [charactersSoundPath("srGuaxinim/ORA!.mp3")],
  },
};
