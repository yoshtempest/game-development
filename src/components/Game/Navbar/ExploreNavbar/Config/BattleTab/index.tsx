import styles from "./styles.module.css";
import { usePlayer } from "@/contexts/PlayerContext";
import { Link } from "react-router";
import { useBattleInfo } from "@/contexts/BattleInfoContext";
import { CardRedeem } from "./CardRedeem";
import { ElementChart } from "../../../shared/ElementChart";

type Props = {
  showComboAction: boolean;
  showHighlight: boolean;
  showAbilityIntro: boolean;
  selectedIndex: number;
};

export function BattleTab({
  showComboAction,
  showHighlight,
  showAbilityIntro,
  selectedIndex,
}: Props) {
  const battleInfoCtx = useBattleInfo();
  const { player } = usePlayer();

  const isInBattle = player.mode === "battle";
  const battleInfo = battleInfoCtx?.battleInfo;

  return (
    <div className={styles.battleContainer}>
      {!battleInfo && !isInBattle && (
        <>
          <div className={styles.toggleContainer}>
            <div
              className={`${styles.toggleItem} ${selectedIndex === 0 ? styles.selected : ""}`}
            >
              {selectedIndex === 0 && <span className={styles.cursor}>▼</span>}
              <h2>Botão de combo: {showComboAction ? "ON" : "OFF"}</h2>
            </div>
            <div
              className={`${styles.toggleItem} ${selectedIndex === 1 ? styles.selected : ""}`}
            >
              {selectedIndex === 1 && <span className={styles.cursor}>▼</span>}
              <h2>Destaque da batalha: {showHighlight ? "ON" : "OFF"}</h2>
            </div>
            <div
              className={`${styles.toggleItem} ${selectedIndex === 2 ? styles.selected : ""}`}
            >
              {selectedIndex === 2 && <span className={styles.cursor}>▼</span>}
              <h2>Intro de habilidade: {showAbilityIntro ? "ON" : "OFF"}</h2>
            </div>
            <div
              className={`${styles.toggleItem} ${selectedIndex === 3 ? styles.selected : ""}`}
            >
              {selectedIndex === 3 && <span className={styles.cursor}>▼</span>}
              <Link className={styles.trainingButton} to={"/training"}>
                Modo Treino
              </Link>
            </div>
          </div>
          <CardRedeem isSelected={selectedIndex === 4} />
        </>
      )}

      <ElementChart />
    </div>
  );
}
