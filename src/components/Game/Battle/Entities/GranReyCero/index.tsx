import { playerPathMarshadowHabilities } from "@/utils/paths";

import {
  GRAN_REY_CERO_EFFECT_HEIGHT,
  GRAN_REY_CERO_EFFECT_WIDTH,
} from "@/data/characters/marshadow/granReyCero";
import { granReyCeroEffectTop } from "@/gameRules/battle/characters/marshadow/granReyCero";
import type { BattleEntityPositioning } from "@/components/Game/Battle/Entities/types";

import styles from "./styles.module.css";

type Props = BattleEntityPositioning & {
  tipX: number;
  tipY: number;
  dirX: number;
  fading: boolean;
  /** PLAYER_SIZE do layout — a lâmina acompanha a imagem do personagem. */
  PLAYER_SIZE: number;
};

/**
 * Lâmina do "Gran Rey Cero": instância `granReyCeroEffect.svg` (652x941)
 * ancorada pela PONTA DE CORTE — a aresta que realmente causa o dano. Mirando
 * para a direita, a ponta fica na borda esquerda do sprite e o corpo da lâmina
 * se estende para trás, de onde ela veio; para a esquerda, tudo espelhado.
 *
 * Verticalmente fica centralizada no sprite renderizado do marshadow, como o
 * feixe do Laser Vastolord, para o corte cortar o inimigo na altura do peito.
 */
export function GranReyCero({
  tipX,
  tipY,
  dirX,
  fading,
  battleScaleX,
  battleScaleY,
  PLAYER_SIZE,
}: Props) {
  const width = GRAN_REY_CERO_EFFECT_WIDTH;
  const height = GRAN_REY_CERO_EFFECT_HEIGHT;
  // O sprite é mais largo que o caminho (652px de largura para 500px de
  // percurso): a ponta alinhada em `tipX` deixa o corpo transbordar para trás
  // da origem, que é de onde a lâmina veio. Na escala em X só é preciso
  // subtrair a largura quando a lâmina aponta para a direita.
  const left = tipX * battleScaleX - (dirX > 0 ? width : 0) / 2;
  const top = granReyCeroEffectTop(tipY, PLAYER_SIZE) * battleScaleY;

  return (
    <img
      src={playerPathMarshadowHabilities("granReyCero/granReyCeroEffect.svg")}
      alt=""
      draggable={false}
      className={fading ? styles.fading : styles.active}
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        transform: dirX > 0 ? undefined : "scaleX(-1)",
        objectFit: "fill",
        zIndex: 4,
        pointerEvents: "none",
      }}
    />
  );
}
