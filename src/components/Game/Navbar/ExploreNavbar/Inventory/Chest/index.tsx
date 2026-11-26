import styles from "./styles.module.css";
import { chestPath } from "@/utils/paths";
import { formatDurationHms } from "@/utils/formatDuration";

type Props = {
  isFocused: boolean;
  isReady: boolean;
  timeLeft: number;
  onOpen: () => void;
};

/**
 * Widget do baú diário no cabeçalho da Mochila. Apresentação pura: o estado e
 * o overlay de recompensa pertencem ao host, que é montado em qualquer aba.
 */
export function Chest({ isFocused, isReady, timeLeft, onOpen }: Props) {
  return (
    <button
      onClick={onOpen} disabled={!isReady}
      className={`${styles.dailyChest} ${
        isFocused ? styles.dailyChestFocused : ""
      }`}
    >
      <img
        loading="lazy"
        decoding="async"
        className={styles.image}
        src={chestPath("default.svg")}
        alt="Baú diário"
      />
      {isReady ? (
        <span className={styles.dailyChestReady}>Disponível!</span>
      ) : (
        <span className={styles.dailyChestTimer}>
          {formatDurationHms(timeLeft)}
        </span>
      )}
    </button>
  );
}
