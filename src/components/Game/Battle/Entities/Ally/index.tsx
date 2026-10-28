import { NPCBattle } from "@/components/Game/Entities/Npc/Battle";
import { getPortalCross } from "@/gameRules/battle/characters/babidi/babidiPortal";
import type { SummonedNpc } from "@/utils/types/npc/npc";
import type { BabidiPortal } from "@/utils/types/character/babidi";

type Props = {
  allies: SummonedNpc[];
  TILE_SIZE: number;
  /** Portais do babidi, para dividir o sprite de quem afunda num deles. */
  babidiPortals?: BabidiPortal[];
};

export function Ally({ allies, TILE_SIZE, babidiPortals = [] }: Props) {
  return (
    <>
      {allies.map((a) => (
        <NPCBattle
          key={a.id}
          x={a.x}
          y={a.y}
          TILE_SIZE={TILE_SIZE}
          npcType={a.npcType}
          state={a.state}
          direction={a.direction}
          isHidden={false}
          isDying={a.isDying}
          babidiPortalCross={getPortalCross(babidiPortals, a.x, a.y)}
        />
      ))}
    </>
  );
}
