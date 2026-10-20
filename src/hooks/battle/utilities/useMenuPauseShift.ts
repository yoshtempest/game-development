import { useEffect, type RefObject } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";

type PauseShift = {
  /** Duração da pausa que acabou de terminar (ms). */
  pausedMs: number;
  /** Início da pausa — base para decidir quais prazos ainda estavam vivos. */
  pauseStart: number;
};

type OnShift = (shift: PauseShift) => void;

/**
 * Observa o ciclo de pausa da batalha (menu aberto → fechado) e, quando ela
 * termina, entrega `onShift` com a duração da pausa. Quem escreve prazo de
 * parede — lock de ação (`freezeActionsUntilRef`), congelamento do mundo
 * (`timeRef`) ou a frente da varredura do mugetsu — estende o próprio prazo
 * com esse valor no unpause.
 *
 * Sem isso, um domínio pausado por 30s "queimaria" o próprio tempo dentro do
 * menu e retomaria perto do fim (ou morto). Só o fechamento chama `onShift`:
 * pausar não mexe em nada, apenas congela (os timers do domínio congelam por
 * fora, via `usePausableTimers`).
 */
export function useMenuPauseShift(isMenuOpen: boolean, onShift: OnShift): void {
  const onShiftRef: RefObject<OnShift> = useLatestRef(onShift);

  useEffect(() => {
    if (!isMenuOpen) return;
    const pauseStart = Date.now();
    // Cópia do ref: o cleanup pode rodar muito depois (unpause/desmontagem) e
    // o valor vivo do ref não é o que estava em vigor quando a pausa começou.
    const shift = onShiftRef.current;

    return () => {
      const pausedMs = Date.now() - pauseStart;
      if (pausedMs > 0) shift({ pausedMs, pauseStart });
    };
  }, [isMenuOpen, onShiftRef]);
}
