import { useMemo, useState } from "react";

import { usePlayerActions } from "@/contexts/PlayerContext";
import { useBattleEmote } from "@/contexts/BattleEmoteContext";
import { useNavbar } from "@/contexts/NavbarContext";
import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import { useStableCallback } from "@/hooks/useStableCallback";
import { EXPLORE_EMOTES } from "@/data/player/emotes";

export type AnimationOption = {
  id: string;
  /** Ícone do menu; ausente usa o ícone de ação (sem asset novo). */
  icon?: string;
  /** Rótulo curto da opção extra de batalha. */
  label?: string;
  disabled?: boolean;
  /** Pose de exploração fica selecionada; a ação de batalha é pontual. */
  persistent?: boolean;
  onSelect: () => void;
};

/**
 * Menu "Animações" do botão flutuante da tela.
 *
 * O botão vive fora da navbar, então este hook não empilha layer de input:
 * `onUp`/`onConfirm` e o bloqueio de `G`/`Tab` pertencem à exploração e à
 * navbar. A seleção acontece só por clique do mouse/toque.
 *
 * A opção "Provocar" é empréstimo da batalha: `BattleEmoteContext` só é
 * preenchido enquanto a cena de luta está montada, então fora dela o menu
 * continua mostrando apenas as poses de exploração.
 */
export function useAnimationsMenu() {
  const { setEmote } = usePlayerActions();
  const { battleEmote } = useBattleEmote();
  const { closeNavbar } = useNavbar();
  const { playSelect } = useMenuSFX();

  const [selectedIndex, setSelectedIndex] = useState(0);

  const options = useMemo<AnimationOption[]>(() => {
    const exploreOptions: AnimationOption[] = EXPLORE_EMOTES.map((option) => ({
      id: option.id,
      icon: option.icon,
      persistent: true,
      onSelect: () => {
        setEmote(option.id);
        // A navbar (se estiver aberta) cobre o mapa: fechá-la deixa a pose visível.
        closeNavbar();
      },
    }));

    if (!battleEmote?.available) return exploreOptions;

    return [
      ...exploreOptions,
      {
        id: "battleEmote",
        label: "Provocar",
        disabled: !battleEmote.usable,
        persistent: false,
        onSelect: battleEmote.trigger,
      },
    ];
  }, [battleEmote, closeNavbar, setEmote]);

  const onSelect = useStableCallback((index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;

    playSelect();
    if (option.persistent) setSelectedIndex(index);
    option.onSelect();
  });

  return { options, selectedIndex, onSelect };
}
