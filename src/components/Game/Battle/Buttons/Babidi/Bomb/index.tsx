import { playerProjectilePath } from "@/utils/paths";

import styles from "./styles.module.css";
import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";

/**
 * Botão do "Gran Rey Cero": dispara a lâmina que corre 500px na direção de
 * mira, parando para rastejar e sangrar todo inimigo num raio de
 * {GRAN_REY_CERO_AOE_RADIUS}px da ponta. Cooldown de 20s.
 *
 * O `background` do botão é montado em TS (e não em `url()` no CSS) para
 * passar por `asset()`, que aplica o BASE_URL do GitHub Pages — um caminho
 * `public/...` literal no CSS resolve para `/assets/public/...` em produção.
 */
const bombClasses: CustomAbilityClasses = {
  button: styles.button,
  label: styles.label,
  ready: styles.ready,
  cooldown: styles.cooldown,
};

export function BombButton({
  ready,
  remaining,
  disabled = false,
  onClick,
}: {
  ready: boolean;
  remaining: number;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <AbilityButton
      type="standard"
      customClasses={bombClasses}
      ready={ready}
      remaining={remaining}
      disabled={disabled}
      onClick={onClick}
      title={`Bomba que recai sobre o inimigo`}
      image={playerProjectilePath("/babidiBomb.svg")}
    />
  );
}
