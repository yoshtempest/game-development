import { PlayerBattle } from "@/components/Game/Entities/Player/Battle";
import type { EmatronCloneVisual } from "@/utils/types/character/ematron";

type Props = {
  clone: EmatronCloneVisual;
  PLAYER_SIZE: number;
};

/**
 * Cópia em silhueta do Ematron durante o hold da habilidade de instância.
 * Reutiliza o sprite idle do Ematron com a silhueta preta (estilo do blink).
 */
export function EmatronClone({ clone, PLAYER_SIZE }: Props) {
  return (
    <PlayerBattle
      character="ematron"
      x={clone.x}
      y={clone.y}
      PLAYER_SIZE={PLAYER_SIZE}
      state="idle"
      direction={clone.direction}
      blinkSilhouette="black"
    />
  );
}
