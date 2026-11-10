import type { CSSProperties } from "react";

import { BabidiFishingNetConstants } from "@/data/characters/babidi";
import { playerAbilityPath } from "@/utils/paths";
import styles from "./styles.module.css";

type Props = {
  net: { x: number; y: number } | null;
  battleScaleX: number;
  battleScaleY: number;
};

/**
 * Rede de pesca do Babidi: inquebrável, sem barra de vida. Apenas o sprite
 * da rede posicionado sobre o inimigo principal enquanto ele fica imobilizado.
 * A rede cai do topo da tela até o alvo (animação de queda) e, se o alvo
 * estiver acima do chão, empurra o inimigo até o chão de y da batalha.
 */
export function FishingNet({ net, battleScaleX, battleScaleY }: Props) {
  if (!net) return null;
  const src = playerAbilityPath("babidi", "fishingNet", "net.svg");
  const fallDistance = net.y * battleScaleY;
  return (
    <div
      className={styles.net}
      style={{
        left: net.x * battleScaleX,
        top: net.y * battleScaleY,
        "--fall-distance": `${fallDistance}px`,
        animationDuration: `${BabidiFishingNetConstants.FALL_MS}ms`,
      } as CSSProperties}
    >
      <img loading="lazy" decoding="async" src={src} alt="fishing net" />
    </div>
  );
}