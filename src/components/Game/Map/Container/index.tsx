import { itemPath } from "@/utils/paths";

import { ITEMS } from "@/data/items";
import { useInventory } from "@/contexts/InventoryContext";

import type { ContainerSlot } from "@/utils/types/container";

import styles from "./styles.module.css";

type Props = {
  isOpen: boolean;
  label: string;
  cols: number;
  size: number;
  slots: ContainerSlot[];
  selectedIndex: number;
};

function SlotContent({ slot }: { slot: ContainerSlot }) {
  if (!slot) return null;

  const itemData = ITEMS[slot.id];
  if (!itemData) return null;

  return (
    <div className={styles.slotContent}>
      <img
        className={styles.slotIcon}
        src={itemData.image ?? itemPath(`${slot.id}.svg`)}
        alt={itemData.name}
      />
      <span className={styles.slotName}>{itemData.name}</span>
    </div>
  );
}

export function Container({
  isOpen,
  label,
  cols,
  size,
  slots,
  selectedIndex,
}: Props) {
  const { items } = useInventory();

  if (!isOpen) return null;

  const renderedSlots = Array.from(
    { length: size },
    (_, i) => slots[i] ?? null,
  );

  const gridStyle = { gridTemplateColumns: `repeat(${cols}, 1fr)` };

  return (
    <div className={`overlay ${styles.overlay}`}>
      <div className={styles.modal}>
        <div>
          <div className={styles.title}>{label}</div>

          <div className={styles.slotsGrid} style={gridStyle}>
            {renderedSlots.map((slot, i) => (
              <div
                key={i}
                className={`${styles.slot} ${i === selectedIndex ? styles.slotSelected : ""}`}
              >
                <SlotContent slot={slot} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className={styles.title}>Seu inventário</div>

          <div className={styles.slotsGrid} style={gridStyle}>
            {items.length === 0 ? (
              <div className={styles.emptyInventory}>Vazio</div>
            ) : (
              items.map((item) => (
                <div key={item.id} className={styles.slot}>
                  <SlotContent slot={item} />
                </div>
              ))
            )}
          </div>

          <div className={styles.hint}>[L] Pegar · [B] Fechar</div>
        </div>
      </div>
    </div>
  );
}
