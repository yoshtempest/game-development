import { NPCBattle } from "@/components/Game/Entities/Npc/Battle";
import { getPortalCross } from "@/gameRules/battle/characters/lucaua/lucauaPortal";
import type { SummonedNpc } from "@/utils/types/npc/npc";
import type { LucauaPortal } from "@/utils/types/character/lucaua";

type Props = {
  summons: SummonedNpc[];
  hiddenIds: Set<string>;
  TILE_SIZE: number;
  /** Portais do lucaua, para dividir o sprite de quem afunda num deles. */
  lucauaPortals?: LucauaPortal[];
};

export function Summon({
  summons,
  hiddenIds,
  TILE_SIZE,
  lucauaPortals = [],
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
          lucauaPortalCross={getPortalCross(lucauaPortals, s.x, s.y)}
        />
      ))}
    </>
  );
}
