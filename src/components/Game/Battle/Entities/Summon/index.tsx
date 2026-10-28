import { NPCBattle } from "@/components/Game/Entities/Npc/Battle";
import { getPortalCross } from "@/gameRules/battle/characters/babidi/babidiPortal";
import type { SummonedNpc } from "@/utils/types/npc/npc";
import type { BabidiPortal } from "@/utils/types/character/babidi";

type Props = {
  summons: SummonedNpc[];
  hiddenIds: Set<string>;
  TILE_SIZE: number;
  /** Portais do babidi, para dividir o sprite de quem afunda num deles. */
  babidiPortals?: BabidiPortal[];
};

export function Summon({
  summons,
  hiddenIds,
  TILE_SIZE,
  babidiPortals = [],
}: Props) {
  return (
    <>
      {summons.map((s) => (
        <NPCBattle
          key={s.id}
          x={s.x}
          y={s.y}
          TILE_SIZE={TILE_SIZE}
          npcType={s.npcType}
          state={s.state}
          direction={s.direction}
          isHidden={hiddenIds.has(s.id)}
          isDying={s.isDying}
          babidiPortalCross={getPortalCross(babidiPortals, s.x, s.y)}
        />
      ))}
    </>
  );
}
