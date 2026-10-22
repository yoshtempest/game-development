import { PlayerBattle } from "@/components/Game/Entities/Player/Battle";
import type { EmanuelCloneVisual } from "@/utils/types/character/emanuel";

type Props = {
  clone: EmanuelCloneVisual;
  PLAYER_SIZE: number;
};

/**
 * Cópia em silhueta do Emanuel durante o hold da habilidade de instância.
 * Reutiliza o sprite idle do Emanuel com a silhueta preta (estilo do blink).
 */
export function EmanuelClone({ clone, PLAYER_SIZE }: Props) {
  return (
    <PlayerBattle
      character="emanuel"
      x={clone.x}
      y={clone.y}
      PLAYER_SIZE={PLAYER_SIZE}
      state="idle"
      direction={clone.direction}
      blinkSilhouette="black"
    />
  );
}
