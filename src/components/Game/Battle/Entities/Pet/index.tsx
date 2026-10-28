import { NPCBattle } from "@/components/Game/Entities/Npc/Battle";
import { getPortalCross } from "@/gameRules/battle/characters/babidi/babidiPortal";
import type { PetState } from "@/hooks/battle/player/pets/usePet";
import type { BabidiPortal } from "@/utils/types/character/babidi";

type Props = {
  pet: PetState;
  TILE_SIZE: number;
  /** Portais do babidi, para dividir o sprite do pet se ele afundar num deles. */
  babidiPortals?: BabidiPortal[];
};

export function Pet({ pet, TILE_SIZE, babidiPortals = [] }: Props) {
  if (!pet) return null;

  return (
    <NPCBattle
      x={pet.x}
      y={pet.y}
      TILE_SIZE={TILE_SIZE}
      npcType={pet.npcType}
      state={pet.state}
      direction={pet.direction}
      babidiPortalCross={getPortalCross(babidiPortals, pet.x, pet.y)}
    />
  );
}
