import { useState } from "react";
import { usePlayerActions } from "@/contexts/PlayerContext";
import { useNavbar } from "@/contexts/NavbarContext";
import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import { useStableCallback } from "@/hooks/useStableCallback";
import { EXPLORE_EMOTES } from "@/data/player/emotes";

/**
 * Menu "Animações" do botão flutuante da tela de exploração.
 *
 * O botão vive fora da navbar, então este hook não empilha layer de input:
 * `onUp`/`onConfirm` e o bloqueio de `G`/`Tab` pertencem à exploração e à
 * navbar. A seleção acontece só por clique do mouse/toque.
 */
export function useAnimationsMenu() {
  const { setEmote } = usePlayerActions();
  const { closeNavbar } = useNavbar();
  const { playSelect } = useMenuSFX();

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useStableCallback((index: number) => {
    const option = EXPLORE_EMOTES[index];
    if (!option) return;

    playSelect();
    setSelectedIndex(index);
    setEmote(option.id);
    // A navbar (se estiver aberta) cobre o mapa: fechá-la deixa a pose visível.
    closeNavbar();
  });

  return { options: EXPLORE_EMOTES, selectedIndex, onSelect };
}
