import { formatStatValue, getStatEffectRows } from "@/data/player/statEffects";
import { STATS } from "@/data/player/statList";
import {
  getStatIncreases,
  useDerivedStats,
} from "@/hooks/player/useDerivedStats";

import styles from "./styles.module.css";

type SelectedStatEffectProps = {
  selectedIndex: number;
};

/**
 * Status derivados do stat selecionado, exibidos abaixo da linha dele.
 *
 * A coluna de Status foi removida do menu: este é o lugar único onde o
 * jogador vê o efeito real do stat que está sob o cursor, com o `+` do
 * próximo ponto já somado. A lista completa continua em "Todos os Status".
 */
export function SelectedStatEffect({ selectedIndex }: SelectedStatEffectProps) {
  const derived = useDerivedStats();
  // O menu navega por índice, mas os dados são indexados pelo nome do stat —
  // `STATS[index]` é a única ponte que não deixa os dois divergirem.
  const statKey = STATS[selectedIndex];
  const increases = statKey ? getStatIncreases(statKey, derived) : {};

  if (!statKey) return null;

  return (
    <div className={styles.effect}>
      {getStatEffectRows(selectedIndex).map((row) => {
        const increase = increases[row.key];

        return (
          <div key={row.key} className={styles.effectRow}>
            <img loading="lazy" decoding="async" src={row.icon} alt="" />
            <p>
              {row.label}: {formatStatValue(derived[row.key], row.format)}
              {increase ? (
                <span className={styles.increase}> +{increase}</span>
              ) : (
                ""
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}
