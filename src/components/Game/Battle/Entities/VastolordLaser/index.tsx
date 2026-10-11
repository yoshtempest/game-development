import { playerProjectilePath } from "@/utils/paths";
import { VASTOLORD_LASER_BEAM_HEIGHT } from "@/data/characters/marcelo/marshadowLaser";
import {
  vastolordLaserTop,
  type VastolordLaserBeam,
} from "@/gameRules/battle/vastolordLaser";
import type { BattleEntityPositioning } from "@/components/Game/Battle/Entities/types";

type Props = BattleEntityPositioning & {
  beam: VastolordLaserBeam | null;
  /** PLAYER_SIZE do layout — o feixe acompanha a imagem renderizada do personagem. */
  PLAYER_SIZE: number;
};

/**
 * Feixe do Laser da Forma Vastolord: instância `vastolordLaser.svg` esticada
 * (o sprite tem exatamente 1000x243, a largura do mapa) do personagem até a
 * ponta do mapa na direção que ele mira, centralizada na imagem do jogador:
 * o centro vertical do feixe coincide com o centro vertical do sprite
 * renderizado do marcelo na Forma Vastolord.
 */
export function VastolordLaser({
  beam,
  battleScaleX,
  battleScaleY,
  PLAYER_SIZE,
}: Props) {
  if (!beam) return null;

  const width = (beam.toX - beam.fromX) * battleScaleX;
  const height = VASTOLORD_LASER_BEAM_HEIGHT * battleScaleY;
  const left = beam.fromX * battleScaleX;
  const top = vastolordLaserTop(beam.y, PLAYER_SIZE) * battleScaleY;

  return (
    <img
      src={playerProjectilePath("vastolordLaser.svg")}
      alt=""
      draggable={false}
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        objectFit: "fill",
        zIndex: 4,
        pointerEvents: "none",
      }}
    />
  );
}
