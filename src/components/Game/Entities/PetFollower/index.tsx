import { memo, useState } from "react";

import { EXPLORE_MOVE_INTERVAL } from "@/gameRules/movement/explore";
import { HEIGHT_STEP_OFFSET } from "@/gameRules/movement/levels";

import { PET_FOLLOWER_SIZE_RATIO } from "@/data/characters/pets/petFollow";

import { getEntityZIndex } from "@/utils/entityDepth";
import { npcPath } from "@/utils/paths";
import {
  petFallbackImagePath,
  petStarStyle,
} from "@/utils/character/petVisuals";

type Props = {
  npcType: string;
  stars: number;
  gridX: number;
  gridY: number;
  height: number;
  direction: Direction;
  moving?: boolean;
  TILE_SIZE: number;
  PLAYER_SIZE: number;
};

/**
 * Sprite de andar do pet seguidor, no mesmo esquema de nomes do jogador
 * (`down`, `movingDown`, `right`, `movingRight`, `up`, `movingUp`; esquerda é
 * a direita espelhada). Fica em `<pet>/follow/` para não colidir com os
 * sprites de batalha que já moram na pasta do pet (`walk.svg`, `right.svg`).
 */
function followSpritePath(
  npcType: string,
  direction: Direction,
  moving: boolean,
): string {
  const spriteDirection = direction === "left" ? "right" : direction;
  const name = moving
    ? `moving${spriteDirection.charAt(0).toUpperCase()}${spriteDirection.slice(1)}`
    : spriteDirection;
  return npcPath(`/${npcType}/follow/${name}.svg`);
}

/**
 * Pet equipado andando um tile atrás do jogador na exploração (#513/#475).
 *
 * A maioria dos pets ainda não tem sprite de andar: cada `src` que falha
 * entra em `failed` e o componente cai para o `default.svg` do pet; se até
 * ele faltar, o pet some em vez de mostrar imagem quebrada. Guardar as falhas
 * (em vez de trocar o `src` no `onError`) evita re-tentar o arquivo ausente a
 * cada passo.
 */
export const PetFollower = memo(function PetFollower({
  npcType,
  stars,
  gridX,
  gridY,
  height,
  direction,
  moving = false,
  TILE_SIZE,
  PLAYER_SIZE,
}: Props) {
  const [failed, setFailed] = useState<ReadonlySet<string>>(() => new Set());

  const candidates = [
    followSpritePath(npcType, direction, moving),
    petFallbackImagePath(npcType),
  ];
  const src = candidates.find((candidate) => !failed.has(candidate));
  if (src == null) return null;

  const size = PLAYER_SIZE * PET_FOLLOWER_SIZE_RATIO;
  const starStyle = petStarStyle(stars);
  const mirror = direction === "left" ? -1 : 1;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        width: size,
        height: size,
        left: gridX * TILE_SIZE - 11 + (PLAYER_SIZE - size) / 2,
        top:
          gridY * TILE_SIZE +
          (PLAYER_SIZE - size) -
          height * TILE_SIZE * HEIGHT_STEP_OFFSET,
        transform: `translate(-10%, -20%) scaleX(${mirror})`,
        zIndex: getEntityZIndex(gridY) - 1,
        transition: `left ${EXPLORE_MOVE_INTERVAL}ms, top ${EXPLORE_MOVE_INTERVAL}ms`,
        pointerEvents: "none",
      }}
    >
      <img
        decoding="async"
        src={src}
        alt=""
        onError={() =>
          setFailed((prev) => {
            if (prev.has(src)) return prev;
            const next = new Set(prev);
            next.add(src);
            return next;
          })
        }
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          filter: starStyle.filter,
          transform: starStyle.transform,
          transformOrigin: "bottom center",
        }}
      />
    </div>
  );
});
