import { memo } from "react";
import { getTombstoneSrc } from "@/gameRules/tombstone/tombstone";
import { getEntityZIndex } from "@/utils/entityDepth";
import type { TombstoneVariant } from "@/utils/types/npc/tombstone";

type Props = {
  gridX: number;
  gridY: number;
  TILE_SIZE: number;
  variant: TombstoneVariant;
  fading?: boolean;
};

/** Props primitivas + cena que re-renderiza por passo: `memo` barato. */
export const Tombstone = memo(function Tombstone({
  gridX,
  gridY,
  TILE_SIZE,
  variant,
  fading,
}: Props) {
  return (
    <img
      loading="lazy"
      decoding="async"
      src={getTombstoneSrc(variant)}
      alt=""
      style={{
        position: "absolute",
        width: TILE_SIZE * 1,
        height: TILE_SIZE * 1,
        left: gridX * TILE_SIZE - 40,
        top: gridY * TILE_SIZE,
        zIndex: getEntityZIndex(gridY),
        opacity: fading ? 0 : 1,
        transition: "opacity 1s ease-in",
        pointerEvents: "none",
      }}
    />
  );
});
