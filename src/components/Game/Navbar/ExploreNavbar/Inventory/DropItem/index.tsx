import { itemPath } from "@/utils/paths";

import { NpcCardImage } from "@/components/Game/NpcCard";

import { ITEMS } from "@/data/items";
import { getCardNpcType } from "@/data/npc";
import { useDropControls } from "@/hooks/menu/useDropControls";
import type { InventoryItem } from "@/utils/types/player/inventory";

import styles from "./styles.module.css";

type Props = {
  isOpen: boolean;
  item: InventoryItem;
  onDrop: (qty: number) => void;
  onClose: () => void;
};

export function DropItem({ isOpen, item, onDrop, onClose }: Props) {
  const itemData = ITEMS[item.id];
  const cardNpcType = getCardNpcType(item.id);
  const maxQty = item.qty ?? 1;

  const { qty } = useDropControls({
    isOpen,
    maxQty,
    onDrop,
    onClose,
  });

  if (!isOpen || !itemData) return null;

  return (
    <div className="overlay">
      <div className={styles.modal}>
        <div className={styles.title}>Largar item</div>

        <div className={styles.itemPreview}>
          {cardNpcType ? (
            <NpcCardImage
              npcType={cardNpcType}
              alt={itemData.name}
              className={styles.itemIcon}
            />
          ) : (
            <img
              loading="lazy"
              decoding="async"
              className={styles.itemIcon}
              src={itemData.image ?? itemPath(`${item.id}.svg`)}
              alt={itemData.name}
            />
          )}
          <span className={styles.itemName}>{itemData.name}</span>
        </div>

        <div className={styles.qtyRow}>
          <span className={styles.qtyLabel}>Quantidade:</span>
          <span className={styles.qtyValue}>{qty}</span>
          <span className={styles.qtyMax}>/ {maxQty}</span>
        </div>

        <div className="hint">[W/S] Quantidade · [L] Largar · [B] Cancelar</div>
      </div>
    </div>
  );
}
