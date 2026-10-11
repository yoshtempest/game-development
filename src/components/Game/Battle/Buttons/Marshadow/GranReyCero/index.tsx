import { Sword } from "lucide-react";

import { playerPathMarshadowHabilities } from "@/utils/paths";

import { GRAN_REY_CERO_AOE_RADIUS } from "@/data/characters/marcelo/granReyCero";

import styles from "./styles.module.css";

type Props = {
  ready: boolean;
  remaining: number;
  disabled?: boolean;
  onClick: () => void;
};

/**
 * Botão do "Gran Rey Cero": dispara a lâmina que corre 500px na direção de
 * mira, parando para rastejar e sangrar todo inimigo num raio de
 * {GRAN_REY_CERO_AOE_RADIUS}px da ponta. Cooldown de 20s.
 *
 * O `background` do botão é montado em TS (e não em `url()` no CSS) para
 * passar por `asset()`, que aplica o BASE_URL do GitHub Pages — um caminho
 * `public/...` literal no CSS resolve para `/assets/public/...` em produção.
 */
export function GranReyCeroButton({
  ready,
  remaining,
  disabled = false,
  onClick,
}: Props) {
  const locked = !ready || disabled;

  return (
    <button
      className={`abilityButton ${styles.button} ${ready ? styles.ready : ""} ${
        disabled ? "abilityDisabled" : ""
      }`}
      style={{
        backgroundImage: `url("${playerPathMarshadowHabilities("granReyCero/background.svg")}")`,
      }}
      onClick={onClick}
      disabled={locked}
      title={`Gran Rey Cero: a lâmina corre 500px na direção de mira, parando para rastejar e cortar todo inimigo num raio de ${GRAN_REY_CERO_AOE_RADIUS}px. Cooldown de 20s.`}
    >
      <span className={`abilityLabel ${styles.label}`}>
        <Sword size={13} />
        GRAN REY CERO
      </span>
      {!ready && remaining > 0 && (
        <span className={styles.cooldown}>{remaining.toFixed(1)}s</span>
      )}
    </button>
  );
}
