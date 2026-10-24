import { memo } from "react";
import { lootBagPath, itemPath } from "@/utils/paths";
import { ITEMS } from "@/data/items";

import styles from "./styles.module.css";

const LOOTBAG_SPRITE = lootBagPath("common.svg");

type Props = {
  gridX: number;
  gridY: number;
  tileSize: number;
  items?: Array<{ id: ItemId; qty: number }>;
};

/** Props primitivas + cena que re-renderiza por passo: `memo` barato. */
export const LootBag = memo(function LootBag({
  gridX,
  gridY,
  tileSize,
  items,
}: Props) {
  // Se for apenas foodPlate ou spoiledFoodPlate, mostra o sprite do item
  if (items && items.length === 1) {
    const itemId = items[0]!.id;
    if (itemId === "foodPlate" || itemId === "spoiledFoodPlate") {
      const itemData = ITEMS[itemId];
      const src = itemData?.image ?? itemPath(`${itemId}.svg`);
      return (
        <img
          className={styles.lootBag}
          src={src}
          alt={itemData?.name ?? itemId}
          style={{
            left: gridX * tileSize,
            top: gridY * tileSize,
            width: tileSize * 0.7,
            height: tileSize * 0.7,
          }}
        />
      );
    }
  }

  return (
    <img
      className={styles.lootBag}
      src={LOOTBAG_SPRITE}
      alt="Saco de loot"
      style={{
        left: gridX * tileSize,
        top: gridY * tileSize,
        width: tileSize,
        height: tileSize,
      }}
    />
  );
});
