import { usePlayerActions } from "@/contexts/PlayerContext";
import { useNavbar } from "@/contexts/NavbarContext";
import { useCircularSelection } from "@/hooks/menu/useCircularSelection";
import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import { useStableCallback } from "@/hooks/useStableCallback";
import { useGameControlsLayer } from "@/hooks/game/useGameControlsLayer";
import { EXPLORE_EMOTES } from "@/data/player/emotes";

/**
 * Menu "Animações" da navbar de exploração.
 *
 * Confirmar uma animação fecha a navbar (que restaura o modo `explore`):
 * a pose só faz sentido vista no mapa, e deixar o menu aberto esconderia o
 * jogador sentado. `onCancel` fica de fora da layer para cair na layer da
 * navbar, que já sabe voltar para a lista de telas.
 */
export function useAnimationsMenu() {
  const { setEmote } = usePlayerActions();
  const { closeNavbar } = useNavbar();
  const { playSelect } = useMenuSFX();

  const {
    selectedIndex,
    setSelectedIndex,
    selectedIndexRef,
    selectPrev,
    selectNext,
  } = useCircularSelection({ length: EXPLORE_EMOTES.length });

  const choose = useStableCallback((index: number) => {
    const option = EXPLORE_EMOTES[index];
    if (!option) return;
    playSelect();
    setEmote(option.id);
    closeNavbar();
  });

  const onUp = useStableCallback(selectPrev);
  const onDown = useStableCallback(selectNext);
  const onConfirm = useStableCallback(() => {
    choose(selectedIndexRef.current);
    return true;
  });

  const onSelect = useStableCallback((index: number) => {
    setSelectedIndex(index);
    choose(index);
  });

  useGameControlsLayer({ onUp, onDown, onConfirm, blockGlobalOpen: true }, []);

  return { options: EXPLORE_EMOTES, selectedIndex, onSelect };
}
