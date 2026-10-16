import { NPCBattle } from "@/components/Game/Entities/Npc/Battle";
import { getPortalCross } from "@/gameRules/battle/lucauaPortal";
import type { SummonedNpc } from "@/utils/types/npc/npc";
import type { LucauaPortal } from "@/utils/types/character/lucaua/lucaua";

type Props = {
  allies: SummonedNpc[];
  TILE_SIZE: number;
  /** Portais do lucaua, para dividir o sprite de quem afunda num deles. */
  lucauaPortals?: LucauaPortal[];
};

export function Ally({ allies, TILE_SIZE, lucauaPortals = [] }: Props) {
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
          lucauaPortalCross={getPortalCross(lucauaPortals, a.x, a.y)}
        />
      ))}
    </>
  );
}
