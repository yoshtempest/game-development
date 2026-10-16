import type { SoundId } from "@/utils/audio/soundId";

/**
 * Toca um efeito sonoro de batalha. `loop`/`volumeOverride` são opcionais — a
 * maioria dos SFX é one-shot e no volume padrão; os que precisam de loop (ex.:
 * áudio de cena) passam `loop = true`.
 */
export type PlaySound = (
  sound: SoundId,
  loop?: boolean,
  volumeOverride?: number,
) => void;
