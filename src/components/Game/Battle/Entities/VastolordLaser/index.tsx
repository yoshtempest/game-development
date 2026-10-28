import { playerProjectilePath } from "@/utils/paths";
import { VASTOLORD_LASER_BEAM_HEIGHT } from "@/data/characters/marshadow/marshadowLaser";
import {
  vastolordLaserTop,
  type VastolordLaserBeam,
} from "@/gameRules/battle/characters/marshadow/vastolordLaser";
import type { BattleEntityPositioning } from "@/components/Game/Battle/Entities/types";
import styles from "./styles.module.css";

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
 * renderizado do marshadow na Forma Vastolord.
 *
 * Animações:
 * - starting: cresce do centro (scaleX 0 -> 1) em 300ms
 * - active: pulso sutil de glow contínuo
 * - ending: encolhe para o centro + fade out em 300ms
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

  const phaseClass =
    beam.phase === "starting"
      ? styles.starting
      : beam.phase === "ending"
        ? styles.ending
        : styles.active;

  return (
    <div
      className={`${styles.container} ${phaseClass}`}
      style={{
        left,
        top,
        width,
        height,
      }}
    >
      <img
        src={playerProjectilePath("vastolordLaser.svg")}
        alt=""
        draggable={false}
        className={styles.beam}
      />
    </div>
  );
}
