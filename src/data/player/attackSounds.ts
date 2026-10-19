import { soundEffectPath } from "@/utils/paths";

type AttackSoundConfig = {
  volume: number;
  sounds: string[];
};

export const ATTACK_SOUNDS: Partial<
  Record<Player["character"], AttackSoundConfig>
> = {
  eduarda: {
    volume: 0.2,
    sounds: [soundEffectPath("/player/eduarda/normalAttack.mp3")],
  },

  marcelo: {
    volume: 0.2,
    sounds: [
      soundEffectPath("/player/marcelo/sword-slash-1.mp3"),
      soundEffectPath("/player/marcelo/sword-slash-2.mp3"),
      soundEffectPath("/player/marcelo/sword-slash-4.mp3"),
    ],
  },

  lucaua: {
    volume: 1,
    sounds: [soundEffectPath("/player/lucaua/shot.mp3")],
  },

  artur: {
    volume: 1,
    sounds: [soundEffectPath("/player/artur/ORA!.mp3")],
  },
};
