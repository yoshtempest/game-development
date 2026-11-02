import type { TimerTask, PausableTimers } from "./types";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";

/** Identidade de um timer agendado — serve para cancelar um só depois. */
export type PausableTimerHandle = number;


/**
 * `setTimeout` consciente de pausa: enquanto a pausa está ativa, cada timer
 * pendente congela com o tempo restante EXATO e rearma de onde parou quando
 * ela termina — nada atrasa, nada dispara duas vezes e nada é descartado.
 *
 * É o que segura a linha do tempo da Expansão de Domínio (e o timer do intro)
 * durante uma pausa do jogador. O sinal passado pelo chamador deve ser a
 * pausa dirigida por ele (menu aberto), não o `isPaused` amplo: em
 * vitória/derrota os timers precisam seguir correndo para caírem no
 * `shouldCancel` da habilidade e cancelarem como sempre fizeram.
 */
export function usePausableTimers(isPaused: boolean): PausableTimers {
  const tasksRef = useRef<TimerTask[]>([]);
  const nextHandleRef = useRef(1);
  const isPausedRef = useLatestRef(isPaused);

  const fire = useCallback(
    (task: TimerTask) => {
      task.timeout = null;

      // Correu na janela entre o render da pausa e o efeito que congela os
      // timers: não executa agora — o tempo já venceu, então o rearm no
      // unpause devolve 0 e ele dispara logo em seguida.
      if (isPausedRef.current) {
        task.remaining = 0;
        return;
      }

      tasksRef.current = tasksRef.current.filter((t) => t !== task);
      task.fn();
    },
    [isPausedRef],
  );

  const arm = useCallback(
    (task: TimerTask) => {
      task.armedAt = Date.now();
      task.timeout = setTimeout(() => fire(task), task.remaining);
    },
    [fire],
  );

  const schedule = useCallback(
    (fn: () => void, delayMs: number) => {
      const task: TimerTask = {
        handle: nextHandleRef.current++,
        fn,
        remaining: delayMs,
        armedAt: 0,
        timeout: null,
      };
      tasksRef.current.push(task);
      if (!isPausedRef.current) arm(task);
      return task.handle;
    },
    [arm, isPausedRef],
  );

  const cancel = useCallback((handle: PausableTimerHandle) => {
    const task = tasksRef.current.find((t) => t.handle === handle);
    if (!task) return;
    if (task.timeout != null) clearTimeout(task.timeout);
    tasksRef.current = tasksRef.current.filter((t) => t !== task);
  }, []);

  const clear = useCallback(() => {
    for (const task of tasksRef.current) {
      if (task.timeout != null) clearTimeout(task.timeout);
    }
    tasksRef.current = [];
  }, []);

  // Congela na abertura da pausa (tempo restante exato) e rearma no
  // fechamento — quem nasceu pausado também só é armado aqui.
  useEffect(() => {
    const tasks = tasksRef.current;

    if (isPaused) {
      for (const task of tasks) {
        if (task.timeout == null) continue;
        clearTimeout(task.timeout);
        task.timeout = null;
        task.remaining = Math.max(
          0,
          task.remaining - (Date.now() - task.armedAt),
        );
      }
      return;
    }

    for (const task of tasks) {
      if (task.timeout != null) continue;
      arm(task);
    }
  }, [arm, isPaused]);

  // Desmontou com timers pendentes: ninguém mais espera por eles.
  useEffect(() => {
    return () => clear();
  }, [clear]);

  // Identidade estável: os consumidores colocam `schedule`/`clear` em dep
  // arrays de useCallback/useEffect sem re-render em cascata.
  return useMemo(
    () => ({ schedule, cancel, clear }),
    [schedule, cancel, clear],
  );
}
