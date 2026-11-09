import { memo } from "react";

type Props = {
  gridX: number;
  gridY: number;
  TILE_SIZE: number;
  src: string;
};

/** Props primitivas + cena que re-renderiza por passo: `memo` barato. */
export const Plate = memo(function Plate({
  gridX,
  gridY,
  TILE_SIZE,
  src,
}: Props) {
  return (
    <img loading="lazy" decoding="async"
      src={src}
      alt=""
      style={{
        position: "absolute",
        width: TILE_SIZE,
        height: TILE_SIZE,
        left: gridX * TILE_SIZE,
        top: gridY * TILE_SIZE,
        zIndex: 5,
        pointerEvents: "none",
      }}
    />
  );
});
