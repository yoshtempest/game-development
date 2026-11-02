export type Props = {
  enabled: boolean;
  durationMs: number;
  /** Pausa a contagem enquanto a batalha estiver pausada. */
  isPausedRef?: React.RefObject<boolean>;
  /** Aponta para o `isEnding` da batalha; para de contar quando ela acaba. */
  isEndingRef?: React.RefObject<{ current: boolean }>;
  onExpire: () => void;
  /** Callback opcional chamado quando o jogador pula a animação de transformação. */
  onSkip?: () => void;
};

export type VastolordFormApi = {
  vastolordActive: boolean;
  vastolordRemainingMs: number;
  /** Quadro atual da transformação (0=screamOne … 3=transformated) ou `null`. */
  transformationFrame: number | null;
  triggerVastolord: () => void;
  resetVastolord: () => void;
  /** Aumenta a duração restante da forma em `ms` (sem efeito fora dela). */
  extendVastolord: (ms: number) => void;
  /** Pula a animação de transformação indo direto ao último quadro. */
  skipVastolordTransform: () => void;
};
