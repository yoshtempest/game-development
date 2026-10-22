import { useEffect, useRef } from "react";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { PLAYER_SPRITE_DIVISOR } from "@/data/grid";
import type { KillerQueenOverlay } from "@/utils/types/character/srGuaxinim";
import type { BattleEntityPositioning } from "@/components/Game/Battle/Entities/types";

type Props = BattleEntityPositioning & {
  killerQueen: KillerQueenOverlay | null;
  killerQueenSprite?: (sprite: KillerQueenOverlay["sprite"]) => string;
  PLAYER_SIZE: number;
};

export function KillerQueen({
  killerQueen,
  killerQueenSprite,
  PLAYER_SIZE,
  battleScaleX,
  battleScaleY,
}: Props) {
  const { playSound } = useSoundEffects();
  const prevKillerQueenSpriteRef = useRef<KillerQueenOverlay["sprite"]>("idle");

  useEffect(() => {
    // killerQueen entrou em palm -> clap.mp3
    // (prePalm.mp3 é disparado pelo arturSeeing.svg no PlayerBattle)
    const sprite = killerQueen?.active ? killerQueen.sprite : "idle";
    if (sprite === "palm" && prevKillerQueenSpriteRef.current !== "palm") {
      playSound("clap");
    }
    prevKillerQueenSpriteRef.current = sprite;
  }, [killerQueen?.active, killerQueen?.sprite, playSound]);

  if (!killerQueen?.active || !killerQueenSprite) return null;

  return (
    <img
      src={killerQueenSprite(killerQueen.sprite)}
      style={{
        position: "absolute",
        left: killerQueen.x * battleScaleX,
        top: killerQueen.y * battleScaleY,
        height: PLAYER_SIZE / PLAYER_SPRITE_DIVISOR,
        width: "auto",
        transform: `translate(-50%, -100%) ${killerQueen.flip ? "scaleX(-1)" : ""}`,
        opacity: killerQueen.opacity,
        transition: "opacity 260ms linear",
        zIndex: 17,
        pointerEvents: "none",
      }}
    />
  );
}
