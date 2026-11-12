import { itemPath } from "@/utils/paths";

import { ITEMS } from "@/data/items";
import { useLootBagControls } from "@/hooks/menu/useLootBagControls";

import styles from "./styles.module.css";

type Props = {
  isOpen: boolean;
  items: GroundItem[];
  onCollectAll: () => void;
  onCollectOne: () => void;
  onClose: () => void;
};

const OPTIONS = [
  { label: "Pegar tudo", key: "L" },
  { label: "Pegar 1x", key: "M" },
  { label: "Cancelar", key: "B" },
] as const;

export function LootBagModal({
  isOpen,
  items,
  onCollectAll,
  onCollectOne,
  onClose,
}: Props) {
  const { selectedIndex } = useLootBagControls({
    isOpen,
    onCollectAll,
    onCollectOne,
    onClose,
  });

  if (!isOpen || items.length === 0) return null;

  return (
    <div className="overlay">
      <div className={styles.modal}>
        <div className={styles.title}>Saco de Loot</div>

        <div className={styles.slotsGrid}>
          {items.map((item) => {
            const itemData = ITEMS[item.id];
            if (!itemData) return null;
            return (
              <div key={item.id} className={styles.slot}>
                <div className={styles.slotContent}>
                  <img
                    loading="lazy"
                    decoding="async"
                    className={styles.slotIcon}
                    src={itemData.image ?? itemPath(`${item.id}.svg`)}
                    alt={itemData.name}
                  />
                  <span className={styles.slotName}>{itemData.name}</span>
                  {item.qty > 1 && (
                    <span className={styles.slotQty}>x{item.qty}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.options}>
          {OPTIONS.map((opt, i) => (
            <div
              key={opt.key}
              className={`${styles.option} ${i === selectedIndex ? styles.optionSelected : ""}`}
            >
              <span className={styles.optionLabel}>
                [{opt.key}] {opt.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
