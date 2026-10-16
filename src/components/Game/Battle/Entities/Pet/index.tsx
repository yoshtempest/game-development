import { NPCBattle } from "@/components/Game/Entities/Npc/Battle";
import { getPortalCross } from "@/gameRules/battle/characters/lucaua/lucauaPortal";
import type { PetState } from "@/hooks/battle/player/pets/usePet";
import type { LucauaPortal } from "@/utils/types/character/lucaua";

type Props = {
  pet: PetState;
  TILE_SIZE: number;
  /** Portais do lucaua, para dividir o sprite do pet se ele afundar num deles. */
  lucauaPortals?: LucauaPortal[];
};

export function Pet({ pet, TILE_SIZE, lucauaPortals = [] }: Props) {
  if (!pet) return null;

  return (
    <NPCBattle
      x={pet.x}
      y={pet.y}
      TILE_SIZE={TILE_SIZE}
      npcType={pet.npcType}
      state={pet.state}
      direction={pet.direction}
      lucauaPortalCross={getPortalCross(lucauaPortals, pet.x, pet.y)}
    />
  );
}
