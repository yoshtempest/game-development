import { NPCBattle } from "@/components/Game/Entities/Npc/Battle";
import type { PetState } from "@/hooks/battle/player/pets/pet/types";

type Props = {
  pet: PetState;
  TILE_SIZE: number;
};

export function Pet({ pet, TILE_SIZE }: Props) {
  if (!pet) return null;

  return (
    <NPCBattle
      x={pet.x}
      y={pet.y}
      TILE_SIZE={TILE_SIZE}
      npcType={pet.npcType}
      state={pet.state}
      direction={pet.direction}
    />
  );
}
