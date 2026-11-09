import { useInventory } from "@/contexts/InventoryContext";
import { useCharacterProgress } from "@/contexts/CharacterProgressContext";
import { CHARACTERS } from "@/data/characters/list";
import styles from "./styles.module.css";
import { chestPath } from "@/utils/paths";
import { formatDurationHms } from "@/utils/formatDuration";

type Props = {
  isFocused: boolean;
  isReady: boolean;
  timeLeft: number;
  onOpen: () => void;
};

export function Chest({ isFocused, isReady, timeLeft, onOpen }: Props) {
  const { items, maxSlots } = useInventory();
  const { progress } = useCharacterProgress();

  const totalCoins = CHARACTERS.reduce(
    (sum, c) => sum + (progress[c]?.coins ?? 0),
    0,
  );
  const totalHyperCoins = CHARACTERS.reduce(
    (sum, c) => sum + (progress[c]?.hyperCoins ?? 0),
    0,
  );
  const currencyCount =
    (totalCoins > 0 ? 1 : 0) + (totalHyperCoins > 0 ? 1 : 0);
  const totalUsed = items.length + currencyCount;

  const slotsLabel =
    maxSlots === Infinity ? `${totalUsed} / ∞` : `${totalUsed} / ${maxSlots}`;

  return (
    <div className={styles.flexColumn}>
      <h3>Inventário {slotsLabel}</h3>
      <div
        className={`${styles.dailyChest} ${
          isFocused ? styles.dailyChestFocused : ""
        }`}
      >
        <div className={styles.dailyChestInfo}>
          <img loading="lazy" decoding="async" className={styles.image} src={chestPath("default.svg")} />
          <span className={styles.dailyChestTitle}>
            Baú Diário -{" "}
            {isReady ? (
              <span className={styles.dailyChestReady}>Disponível!</span>
            ) : (
              <span className={styles.dailyChestTimer}>
                {formatDurationHms(timeLeft)}
              </span>
            )}
          </span>
        </div>
        {isReady && (
          <button className="dailyButton" onClick={onOpen}>
            Abrir
          </button>
        )}
      </div>
    </div>
  );
}
