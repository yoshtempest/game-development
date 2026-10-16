import { useEffect } from "react";

import { LucauaShieldConstants } from "@/data/characters/lucaua";
import { playerPath } from "@/utils/paths";

import styles from "./styles.module.css";

import type { LucauaShieldSide } from "@/utils/types/character/lucaua";

type Props = {
  /** Lado do corpo coberto pelo shield (o lado de quem ataca). */
  side: LucauaShieldSide;
  /** Nonce do lado no hook: muda a cada golpe bloqueado. */
  nonce: number;
  /** Avisa o hook que o fade-out terminou (o lado pode sair do estado). */
  onEnd: (side: LucauaShieldSide, nonce: number) => void;
};

/**
 * Overlay do bloqueio do lucaua: `shield.svg` surge no lado de quem ataca,
 * pisca em silhueta branca e some sozinho após `HOLD_MS` sem novos golpes.
 *
 * O componente é montado por `key={side + nonce}` no `PlayerBattle`: cada golpe
 * bloqueado o remonta, reexecutando o blink. O timer de saída vive aqui, não no
 * hook — assim o fade acontece mesmo com o jogador ainda segurando o block.
 */
export function LucauaShield({ side, nonce, onEnd }: Props) {
  useEffect(() => {
    const timer = setTimeout(
      () => onEnd(side, nonce),
      LucauaShieldConstants.HOLD_MS + LucauaShieldConstants.FADE_MS,
    );

    return () => clearTimeout(timer);
  }, [onEnd, side, nonce]);

  return (
    <img
      src={playerPath("/lucaua/inFight/shield.svg")}
      alt=""
      className={styles.shield}
      style={
        {
          // A metade do corpo coberta: o sprite é largo (o dobro da barra), então
          // o shield cobre a metade esquerda/direita a partir do centro. O lado
          // esquerdo espelha (`scaleX(-1)`) porque o `shield.svg` nasce virado
          // para a direita.
          transform:
            side === "left" ? "translateX(-100%) scaleX(-1)" : "translateX(0)",
          "--shield-blink-ms": `${LucauaShieldConstants.BLINK_MS}ms`,
          "--shield-fade-ms": `${LucauaShieldConstants.FADE_MS}ms`,
          "--shield-hold-ms": `${LucauaShieldConstants.HOLD_MS}ms`,
        } as React.CSSProperties & Record<string, string>
      }
    />
  );
}
