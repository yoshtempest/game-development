import { npcPath } from "@/utils/paths";
import { getBossSizeMultiplier } from "@/utils/npc/getSpritePath";
import type { CoffinState } from "@/hooks/battle/summon/coffinAnimation/types";
import type { BattleEntityPositioning } from "@/components/Game/Battle/Entities/types";

type Props = BattleEntityPositioning & {
  coffins: CoffinState[];
  TILE_SIZE: number;
};

export function Coffin({
  coffins,
  TILE_SIZE,
  battleScaleX,
  battleScaleY,
}: Props) {
  return (
    <>
      {coffins.map((c) => {
        const coffinSrc =
          c.phase === "closed"
            ? npcPath("/hungryKing/coffin.svg")
            : npcPath("/hungryKing/coffinOpen.svg");

        const sizeMultiplier = getBossSizeMultiplier(c.npcType);

        return (
          <div
            key={c.id}
            style={{
              position: "absolute",
              width: TILE_SIZE * sizeMultiplier,
              height: TILE_SIZE * sizeMultiplier,
              left: c.x * battleScaleX,
              top: c.y * battleScaleY,
              transform: "translate(-50%, -100%)",
              opacity: c.phase === "fading" ? 0 : 1,
              transition: "opacity 500ms linear",
              zIndex: 8,
            }}
          >
            <img
              src={coffinSrc}
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </div>
        );
      })}
    </>
  );
}
