import { useState } from "react";

import type {
  BattleMapConfig,
  BattleObstacle,
} from "@/utils/types/maps/battle";
import { TILE_COLORS } from "@/data/battle/tileColors";
import { ProjectileConstants } from "@/data/projectile";
import { getViewportSize } from "@/utils/viewport";
import { mapAssetPath } from "@/utils/paths";

type Props = {
  map: BattleMapConfig;
};

type TileProps = {
  obstacle: BattleObstacle;
  scaleX: number;
  scaleY: number;
};

/**
 * Um obstáculo da arena. Com `sprite`, desenha a arte; se o arquivo ainda
 * não existir em `public/assets/map/` (`onError`), volta para o bloco de cor
 * sólida de `TILE_COLORS` — o player precisa enxergar onde pode pisar mesmo
 * antes de a arte ser feita, e a cor não pode ficar atrás de um sprite com
 * transparência.
 */
function ObstacleTile({ obstacle, scaleX, scaleY }: TileProps) {
  const [spriteFailed, setSpriteFailed] = useState(false);
  const showSprite = !!obstacle.sprite && !spriteFailed;

  return (
    <div
      style={{
        position: "absolute",
        left: obstacle.x * scaleX,
        top: obstacle.y * scaleY,
        width: obstacle.width * scaleX,
        height: obstacle.height * scaleY,
        backgroundColor: showSprite
          ? "transparent"
          : TILE_COLORS[obstacle.type] || "#888",
        border: showSprite ? undefined : "1px solid rgba(0,0,0,0.3)",
        boxSizing: "border-box",
        zIndex: 1,
      }}
    >
      {showSprite && obstacle.sprite && (
        <img
          src={mapAssetPath(obstacle.sprite)}
          alt=""
          draggable={false}
          onError={() => setSpriteFailed(true)}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      )}
    </div>
  );
}

export function BattleMap({ map }: Props) {
  const scaleX = getViewportSize().width / ProjectileConstants.MAP_WIDTH;
  const scaleY = getViewportSize().height / ProjectileConstants.MAP_HEIGHT;

  return (
    <>
      {map.obstacles.map((ob, i) => (
        <ObstacleTile key={i} obstacle={ob} scaleX={scaleX} scaleY={scaleY} />
      ))}
    </>
  );
}
