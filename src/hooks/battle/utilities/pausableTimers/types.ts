import type { PausableTimerHandle } from "@/hooks/battle/utilities/pausableTimers/usePausableTimers";

export type TimerTask = {
  handle: PausableTimerHandle;
  fn: () => void;
  /** Ms que faltavam quando a pausa congelou o timer (ou o delay original). */
  remaining: number;
  /** Momento em que o timer foi armado — base do cálculo do `remaining`. */
  armedAt: number;
  timeout: ReturnType<typeof setTimeout> | null;
};

export type PausableTimers = {
  /**
   * Agenda `fn` para daqui a `delayMs`. Com a pausa ativa, o timer nasce
   * congelado e rearma assim que ela terminar.
   */
  schedule: (fn: () => void, delayMs: number) => PausableTimerHandle;
  /** Cancela um timer específico — os demais continuam de pé. */
  cancel: (handle: PausableTimerHandle) => void;
  /** Cancela todos os timers pendentes deste hook. */
  clear: () => void;
};
