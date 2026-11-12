import { usePlayer } from "@/contexts/PlayerContext";
import { useCharacterProgress } from "@/contexts/CharacterProgressContext";
import { useEquipment } from "@/contexts/EquipmentContext";
import { canSpendPoints } from "@/gameRules/menu/validation";
import { STATS_MENU_ROWS } from "@/data/player/statEffects";
import { statusIconPath } from "@/utils/paths";
import { SelectedStatEffect } from "./SelectedStatEffect";

import styles from "./styles.module.css";

type AvailableStatsProps = {
  /** `null` = nenhum stat marcado; nada é gasto até o jogador escolher. */
  selectedIndex: number | null;
  onSelectStat: (index: number) => void;
  onConfirmStat: () => void;
};

export function AvailableStats({
  selectedIndex,
  onSelectStat,
  onConfirmStat,
}: AvailableStatsProps) {
  const { player } = usePlayer();
  const character = player.character;
  const { progress } = useCharacterProgress();
  const { getTotalBonus } = useEquipment();

  const stats = progress[character]?.stats ?? {
    strength: 1,
    technique: 1,
    spirit: 1,
    resistance: 1,
    tenacity: 1,
    luck: 1,
    points: 0,
  };
  const bonus = getTotalBonus(character);
  const hasPoints = canSpendPoints(stats.points);
  const canConfirm = selectedIndex !== null && hasPoints;

  return (
    <div className={`StatusColumn ${styles.container}`}>
      <div className="statusMainContainer">
        <div className="statusHeader">
          <img
            loading="lazy"
            decoding="async"
            src={statusIconPath("disponiblePoints.svg")}
          />
          <h2 className="StatusTitle">Pontos disponíveis: {stats.points}</h2>
        </div>
        <button
          type="button"
          className="statusButton"
          // `data-confirm` marca este botão para o clique fora do menu não
          // limpar a seleção (ver `Status`).
          data-confirm
          onClick={onConfirmStat}
          disabled={!canConfirm}
        >
          Confirmar
        </button>
      </div>
      <div className={styles.statsGrid}>
        {STATS_MENU_ROWS.map((row, index) => {
          const isSelected = selectedIndex === index;
          const value = stats[row.key] ?? 1;
          const rowBonus = row.bonusKey ? bonus[row.bonusKey] : 0;

          return (
            <div
              className={`${styles.statItem} ${
                isSelected ? styles.active : ""
              }`}
              key={row.key}
            >
              <button
                type="button"
                className={styles.statLabel}
                // `data-stat-row`: só clicar na linha do stat preserva a
                // seleção; qualquer outro lugar da tela limpa.
                data-stat-row
                onClick={() => onSelectStat(index)}
                aria-pressed={isSelected}
              >
                <img loading="lazy" decoding="async" src={row.icon} />
                <span>
                  {row.label}: {value}
                  {rowBonus > 0 && (
                    <span className={styles.bonus}>+{rowBonus}</span>
                  )}
                </span>
              </button>
              {isSelected && <SelectedStatEffect selectedIndex={index} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
