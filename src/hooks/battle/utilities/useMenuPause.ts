import { type RefObject } from "react";

import { useNavbar } from "@/contexts/NavbarContext";
import { useBattleNavbar } from "@/contexts/BattleNavbarContext";
import { useLatestRef } from "@/hooks/useLatestRef";

type MenuPause = {
  /** true enquanto algum menu da batalha estiver aberto. */
  isMenuOpen: boolean;
  /** O mesmo valor em ref — para os hooks que leem fora do ciclo de render. */
  isMenuOpenRef: RefObject<boolean>;
};

/**
 * Pausa dirigida pelo jogador: o menu de batalha (ou o navbar da exploração)
 * aberto.
 *
 * Ela congela a IA, os ticks, os sons e o tempo de batalha, mas NÃO aborta a
 * habilidade em curso: o golpe tem de continuar enquanto o menu está aberto.
 * Antes a pausa entrava no `shouldCancel` das habilidades e a entidade gerada
 * (a lâmina do Gran Rey Cero, a esfera do natsuki, a explosão do Atomic)
 * sumia no meio do caminho — o cooldown já gasto virava "nada aconteceu".
 *
 * A pausa que interrompe a batalha de verdade (vitória, derrota, cutscene,
 * rewind) é o `isPaused` amplo do `useScene`: ela cancela tudo.
 */
export function useMenuPause(): MenuPause {
  const { isNavOpen } = useNavbar();
  const { isBattleNavOpen } = useBattleNavbar();

  const isMenuOpen = isNavOpen || isBattleNavOpen;
  const isMenuOpenRef = useLatestRef(isMenuOpen);

  return { isMenuOpen, isMenuOpenRef };
}
