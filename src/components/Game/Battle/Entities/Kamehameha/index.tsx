import { playerPathEmanuelHabilities } from "@/utils/paths";
import { EMANUEL_KAMEHAMEHA_BEAM_HEIGHT } from "@/data/characters/emanuel/emanuel";
import {
  kamehamehaTop,
  type KamehamehaEffect,
} from "@/gameRules/battle/characters/emanuel/kamehameha";
import type { BattleEntityPositioning } from "@/components/Game/Battle/Entities/types";
import styles from "./styles.module.css";

type Props = BattleEntityPositioning & {
  effect: KamehamehaEffect | null;
};

/**
 * Feixe de Kamehameha do Emanuel: instância `kamehamehaEffect.svg` esticada
 * (o sprite tem 500x178, a largura do mapa) do personagem até a ponta do mapa na
 * direção que ele mira, centralizado na imagem do jogador: o centro vertical do
 * feixe coincide com o centro vertical do sprite renderizado do emanuel.
 *
 * Animações:
 * - starting: cresce do centro (scaleX 0 -> 1) em 500ms
 * - active: pulso sutil de glow contínuo
 * - ending: encolhe para o centro + fade out em 500ms
 */
export function Kamehameha({
  effect,
  battleScaleX,
  battleScaleY,
}: Props) {
  if (!effect) return null;

  const width = Math.abs(effect.toX - effect.fromX) * battleScaleX;
  const height = EMANUEL_KAMEHAMEHA_BEAM_HEIGHT * battleScaleY;
  const left = Math.min(effect.fromX, effect.toX) * battleScaleX;
  const top = kamehamehaTop(effect.y) * battleScaleY;

  const phaseClass =
    effect.phase === "starting"
      ? styles.starting
      : effect.phase === "ending"
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
        src={playerPathEmanuelHabilities("/kamehameha/kamehamehaEffect.svg")}
        alt=""
        draggable={false}
        className={styles.beam}
      />
    </div>
  );
}
