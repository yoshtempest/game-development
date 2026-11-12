import { itemPath } from "@/utils/paths";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./styles.module.css";
import { useInventory } from "@/contexts/InventoryContext";
import { getBattleItems } from "@/gameRules/items/battleItems";
import { ITEMS } from "@/data/items";
import { circularNext, circularPrev } from "@/gameRules/menu/navigation";
import { useGameControlsLayer } from "@/hooks/game/useGameControlsLayer";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import { useConsumeItem } from "@/hooks/menu/useConsumeItem";
import type { InventoryItem } from "@/utils/types/player/inventory";

export function BattleInventory() {
  const { items } = useInventory();
  const { consumeItemRef } = useConsumeItem();
  const { playMove, playSelect } = useMenuSFX();
  const listRef = useRef<HTMLUListElement>(null);

  const battleItems = useMemo(() => getBattleItems(items), [items]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [rejectedIndex, setRejectedIndex] = useState<number | null>(null);

  useEffect(() => {
    setSelectedIndex((prev) =>
      battleItems.length === 0 ? 0 : Math.min(prev, battleItems.length - 1),
    );
  }, [battleItems.length]);

  const selectedIndexRef = useLatestRef(selectedIndex);
  const battleItemsRef = useLatestRef(battleItems);
  const playMoveRef = useLatestRef(playMove);
  const playSelectRef = useLatestRef(playSelect);

  useGameControlsLayer(
    {
      onUp: () => {
        if (battleItemsRef.current.length === 0) return false;
        playMoveRef.current();
        setSelectedIndex((prev) =>
          circularPrev(prev, battleItemsRef.current.length),
        );
        return true;
      },
      onDown: () => {
        if (battleItemsRef.current.length === 0) return false;
        playMoveRef.current();
        setSelectedIndex((prev) =>
          circularNext(prev, battleItemsRef.current.length),
        );
        return true;
      },
      onConfirm: () => {
        const item: InventoryItem | undefined =
          battleItemsRef.current[selectedIndexRef.current];
        if (!item) return false;
        const used = consumeItemRef.current(item.id);
        if (used) {
          playSelectRef.current();
          return true;
        }
        setRejectedIndex(selectedIndexRef.current);
        setTimeout(() => setRejectedIndex(null), 1500);
        return true;
      },
      blockGlobalOpen: true,
    },
    [],
  );

  useEffect(() => {
    if (!listRef.current) return;
    const selectedElement = listRef.current.children[selectedIndex] as
      HTMLElement | undefined;
    selectedElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedIndex]);

  function getItemImage(item: InventoryItem) {
    const itemData = ITEMS[item.id];
    return itemData?.image ? itemData.image : itemPath(`${item.id}.svg`);
  }

  return (
    <div className="containerOfNavbar">
      <h2>Inventário de Batalha</h2>
      {battleItems.length === 0 ? (
        <p className={styles.empty}>Nenhum item utilizável em batalha.</p>
      ) : (
        <ul ref={listRef} className={styles.list}>
          {battleItems.map((item, index) => {
            const itemData = ITEMS[item.id];
            return (
              <li
                key={`${item.id}-${index}`}
                className={`${styles.itemRow} ${
                  index === selectedIndex ? styles.selected : ""
                } ${index === rejectedIndex ? styles.rejected : ""}`}
              >
                <img
                  loading="lazy"
                  decoding="async"
                  className={styles.icon}
                  src={getItemImage(item)}
                  alt={itemData?.name ?? item.id}
                />
                <div className={styles.info}>
                  <span className={styles.name}>
                    {itemData?.name ?? item.id}
                    {item.qty && item.qty > 1 ? ` x${item.qty}` : ""}
                  </span>
                  {itemData?.description && (
                    <span className={styles.description}>
                      {itemData.description}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
