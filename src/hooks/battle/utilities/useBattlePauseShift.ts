import type { RefObject } from "react";

import { useMenuPauseShift } from "@/hooks/battle/utilities/useMenuPauseShift";

type Options = {
  /** Pausa dirigida pelo jogador (menu de batalha / navbar aberto). */
  isMenuOpen: boolean;
  /** Lock de ação compartilhado (movimento, ataque, habilidades). */
  freezeActionsUntilRef: RefObject<number>;
  /** Efeitos de tempo da batalha (freeze/slow do mundo, hitstop...). */
  timeRef: RefObject<TimeEffect[]>;
};

/**
 * Devolve o tempo parado no menu aos dois prazos de parede que TODA a batalha
 * compartilha: o lock de ação e os efeitos de tempo.
 *
 * Os dois são escritos como `Date.now() + duração` por dezenas de hooks
 * (habilidades, câmera, domínios, esferas). Sem o deslocamento, a pausa
 * "queimava" o prazo dentro do menu: o lock acabava antes da habilidade (o
 * jogador andava no meio do golpe) e o congelamento do mundo expirava com a
 * esfera ainda no Setup. Centralizar aqui é o que impede cada habilidade de
 * reimplementar — e esquecer — o mesmo ajuste; quem tem timestamp PRÓPRIO
 * (início de fase, início do feixe) continua deslocando só o que é dele via
 * `useMenuPauseShift`.
 *
 * Só prazos ainda vivos no início da pausa são estendidos: um lock que já
 * tinha vencido não pode renascer no unpause.
 */
export function useBattlePauseShift({
  isMenuOpen,
  freezeActionsUntilRef,
  timeRef,
}: Options): void {
  useMenuPauseShift(isMenuOpen, ({ pausedMs, pauseStart }) => {
    if (freezeActionsUntilRef.current > pauseStart) {
      freezeActionsUntilRef.current += pausedMs;
    }
    timeRef.current = timeRef.current.map((effect) =>
      effect.until > pauseStart
        ? { ...effect, until: effect.until + pausedMs }
        : effect,
    );
  });
}
