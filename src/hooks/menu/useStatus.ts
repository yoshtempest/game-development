import { useCharacterProgress } from "@/contexts/CharacterProgressContext";
import { canSpendPoints } from "@/gameRules/menu/validation";
import { STATS } from "@/data/player/statList";
import { useCircularSelection } from "@/hooks/menu/useCircularSelection";
import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import { useStableCallback } from "@/hooks/useStableCallback";
import { useGameControlsLayer } from "@/hooks/game/useGameControlsLayer";

/**
 * Menu de Status: distribuir pontos de stat.
 *
 * Nada começa selecionado de propósito — com um stat já marcado, o ponto
 * acabava gasto sem o jogador ter escolhido nada. O gasto só acontece em
 * duas ações deliberadas: confirmar no teclado/gamepad ou clicar em
 * "Confirmar". Marcar é de graça (`selectStat`).
 */
export function useStatusMenu(
  isOpen: boolean,
  characterId: CharacterId,
  onBack?: () => void,
) {
  const { addStat, progress } = useCharacterProgress();
  const { playMove, playSelect } = useMenuSFX();

  const {
    selectedIndex,
    setSelectedIndex,
    selectedIndexRef,
    selectPrev,
    selectNext,
    // `number | null` explícito: `null` sozinho fixaria T em `null`.
  } = useCircularSelection({
    length: STATS.length,
    initialIndex: null as number | null,
  });

  // retorno descartado: setas não consomem input nesta tela
  const onUp = useStableCallback(() => selectPrev());
  const onDown = useStableCallback(() => selectNext());

  /** Gasta um ponto no stat do índice dado; `null` (nada escolhido) não gasta. */
  const spendStat = useStableCallback((index: number | null) => {
    const stat = index === null ? undefined : STATS[index];
    const char = progress[characterId];
    if (!stat || !char || !canSpendPoints(char.stats.points)) return false;

    addStat(characterId, stat);
    return true;
  });

  const onConfirm = useStableCallback(() => {
    // Sempre consome: sem stat marcado (ou sem pontos) o "A" não pode cair
    // na layer de baixo e abrir um item do navbar por engano.
    if (!spendStat(selectedIndexRef.current)) return true;
    playSelect();
    return true;
  });

  /** Clique na linha do stat: só marca, não gasta ponto. */
  const selectStat = useStableCallback((index: number) => {
    setSelectedIndex(index);
    playMove();
    return true;
  });

  /**
   * Volta a tela ao estado de abertura: nenhum stat marcado.
   *
   * Usado no clique fora (ver `Status`) e em qualquer momento em que a
   * escolha deixa de valer.
   */
  const clearStat = useStableCallback(() => {
    setSelectedIndex(null);
    return true;
  });

  /** Botão "Confirmar": é aqui que o ponto disponível é realmente usado. */
  const confirmStat = useStableCallback(() => {
    if (!spendStat(selectedIndexRef.current)) return false;
    playSelect();
    return true;
  });

  // Cancelar volta para a seleção de personagens em vez de fechar a navbar:
  // o Status é uma sub-tela do menu de Personagem.
  const cancel = useStableCallback(() => {
    onBack?.();
    return true;
  });

  useGameControlsLayer(
    {
      onUp,
      onDown,
      onConfirm,
      onCancel: cancel,
      blockGlobalOpen: true,
    },
    [isOpen, cancel],
  );

  return {
    selectedIndex,
    options: STATS,
    selectStat,
    confirmStat,
    clearStat,
  };
}
