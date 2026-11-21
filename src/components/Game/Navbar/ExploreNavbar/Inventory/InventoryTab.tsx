import { chestPath } from "@/utils/paths";
import { useCallback, useMemo, useRef, useState } from "react";
import { useInventory } from "@/contexts/InventoryContext";
import { useInventoryMenu } from "@/hooks/menu/useInventory";
import type { FilterConfig } from "@/utils/types/inventory/filterConfig";
import {
  useChestOpening,
  type ChestOpenOutcome,
} from "@/hooks/chest/useChestOpening";
import styles from "./styles.module.css";
import { ITEMS } from "@/data/items";
import { CHEST_OPENED_SPRITES } from "@/data/items/chests/chestItems";
import { FilterBar } from "./FilterBar";
import { ListItem } from "./ListItem";
import { RewardsView } from "./RewardsView";
import { ChestOpeningAnimation } from "./ChestOpeningAnimation";
import { useItemEffect } from "@/hooks/items/useItemEffect";
import { FILTER_LABELS } from "@/data/inventory/labels";
import { PROFESSION_ITEMS } from "@/data/professions/professionItems";
import { useCharacterProgress } from "@/contexts/CharacterProgressContext";
import { CHARACTERS } from "@/data/characters/list";
import type { InventoryItem } from "@/utils/types/player/inventory";
import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import { useStableCallback } from "@/hooks/useStableCallback";
import { useSFXPool } from "@/hooks/menu/useSFXPool";
import { useConsumeItem } from "@/hooks/menu/useConsumeItem";
import { useItemControls } from "@/hooks/menu/itemControls/useItemControls";
import { useRewardsControls } from "@/hooks/menu/rewardsControls/useRewardsControls";
import { DropItem } from "./DropItem";
import { isDroppable } from "@/data/items/droppable";
import { useGroundItems } from "@/contexts/GroundItemContext";
import { usePlayer } from "@/contexts/PlayerContext";

const CURRENCY_IDS = ["kwanzas", "hypercoin"] as const;

type Props = {
  isActive: boolean;
  chestReady: boolean;
  onFocusChest: () => void;
  onFocusTabs: () => void;
  onPopup: (message: string) => void;
};

/**
 * Conteúdo da aba Inventário. O baú diário vive no cabeçalho do host (ao lado
 * das abas) para poder ser aberto de qualquer subseção; aqui ficam apenas os
 * baús de item da mochila.
 */
export function InventoryTab({
  isActive,
  chestReady,
  onFocusChest,
  onFocusTabs,
  onPopup,
}: Props) {
  const { items, maxSlots, removeItem } = useInventory();
  const { progress } = useCharacterProgress();
  const { addLoot, currentLocationId } = useGroundItems();
  const { player } = usePlayer();
  const listRef = useRef<HTMLUListElement>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const totalCoins = CHARACTERS.reduce(
    (sum, c) => sum + (progress[c]?.coins ?? 0),
    0,
  );
  const totalHyperCoins = CHARACTERS.reduce(
    (sum, c) => sum + (progress[c]?.hyperCoins ?? 0),
    0,
  );

  const currencyItems = useMemo<InventoryItem[]>(
    () => [
      { id: "kwanzas", qty: totalCoins },
      { id: "hypercoin", qty: totalHyperCoins },
    ],
    [totalCoins, totalHyperCoins],
  );

  const itemsWithCurrency = useMemo(
    () => [...currencyItems, ...items],
    [currencyItems, items],
  );

  const filteredItems = useMemo(() => {
    if (filterType === "all") return itemsWithCurrency;
    if (filterType.startsWith("prof_")) {
      const professionId = filterType.slice(5);
      const professionItemIds =
        PROFESSION_ITEMS[professionId as keyof typeof PROFESSION_ITEMS];
      if (!professionItemIds) return itemsWithCurrency;
      return itemsWithCurrency.filter((item) => professionItemIds.has(item.id));
    }
    return itemsWithCurrency.filter((item) => {
      const itemData = item ? ITEMS[item.id] : null;
      return itemData?.type === filterType;
    });
  }, [filterType, itemsWithCurrency]);

  const filterConfig = useMemo<FilterConfig | null>(
    () => ({
      labels: FILTER_LABELS,
      active: filterType,
      onChange: (type) => setFilterType(type),
      filteredItems,
    }),
    [filterType, filteredItems],
  );

  const { selectedIndex, filterFocused } = useInventoryMenu(
    isActive,
    listRef,
    filterConfig,
    chestReady,
    onFocusChest,
    onFocusTabs,
  );

  const {
    openPlayerChest,
    lastResult: chestLastResult,
    setLastResult,
    lastOpened,
    otherChestExists,
    openNextChest,
  } = useChestOpening();

  const { playMove, playSelect } = useMenuSFX();

  const { playSFX } = useSFXPool();
  const { getEffect } = useItemEffect({ playSFX });
  const { consumeItemRef } = useConsumeItem();

  const [openingChestTier, setOpeningChestTier] = useState<NPCClass | null>(
    null,
  );
  const [rewardOptionIndex, setRewardOptionIndex] = useState(0);
  const [rejectedIndex, setRejectedIndex] = useState<number | null>(null);
  const [dropItem, setDropItem] = useState<InventoryItem | null>(null);

  const handleChestOutcome = (outcome: ChestOpenOutcome) => {
    if (outcome.status === "opened") {
      setOpeningChestTier(outcome.result.tier);
    } else if (outcome.status === "inventoryFull") {
      onPopup("Mochila cheia");
    }
  };

  const handleOpenPlayerChest = (id: ItemId) => {
    handleChestOutcome(openPlayerChest(id));
  };

  const handleOpenNextChest = (id?: ItemId) => {
    handleChestOutcome(openNextChest(id));
  };

  const handleConfirmDrop = useCallback(
    (qty: number) => {
      if (!dropItem || !player || !currentLocationId) return;
      removeItem(dropItem.id, qty);
      addLoot(currentLocationId, player.gridX, player.gridY, [
        { id: dropItem.id, qty },
      ]);
      setDropItem(null);
    },
    [dropItem, player, currentLocationId, removeItem, addLoot],
  );

  const handleCloseDrop = useCallback(() => {
    setDropItem(null);
  }, []);

  const hasOtherChest = !!(
    chestLastResult && otherChestExists(chestLastResult.tier)
  );
  const chestRewardsVisible = !!chestLastResult && !openingChestTier;
  const rewardOptionCount = chestRewardsVisible ? (hasOtherChest ? 2 : 1) : 0;

  const closeRewards = useStableCallback(() => setLastResult(null));

  const selectedItem = filteredItems[selectedIndex];
  const selectedItemData = selectedItem ? ITEMS[selectedItem.id] : null;

  const handleDropItem = useCallback(() => {
    if (!selectedItem) return;
    setDropItem(selectedItem);
  }, [selectedItem]);

  const isChestSelected = selectedItemData?.type === "chest";
  const isConsumableSelected =
    selectedItemData?.type === "consumable" ||
    selectedItemData?.type === "food";
  const isMapSelected = selectedItemData?.type === "map";
  const isTeleportSelected = selectedItemData?.type === "teleport";
  const isDroppableItem =
    !!selectedItem &&
    isDroppable(selectedItem.id) &&
    !(CURRENCY_IDS as readonly string[]).includes(selectedItem.id);

  const tier =
    isChestSelected && selectedItem
      ? (selectedItem.id.replace("_chest", "") as NPCClass)
      : null;
  const keyId = tier ? (`${tier}_key` as ItemId) : null;

  useRewardsControls({
    isActive,
    chestRewardsVisible,
    rewardOptionCount,
    lastOpened,
    playMove,
    playSelect,
    closeRewards,
    openNextChest: handleOpenNextChest,
    onRewardOptionChange: setRewardOptionIndex,
  });

  useItemControls({
    isActive,
    filterFocused,
    chestFocused: false,
    selectedItem,
    isConsumableSelected,
    isChestSelected,
    isMapSelected,
    isTeleportSelected,
    isDroppableSelected: isDroppableItem,
    keyId,
    items,
    openPlayerChest: handleOpenPlayerChest,
    getEffect,
    consumeItem: consumeItemRef.current,
    onReject: () => {
      setRejectedIndex(selectedIndex);
      setTimeout(() => setRejectedIndex(null), 1500);
    },
    onNoKey: () => onPopup("Sem chave"),
    onDropItem: handleDropItem,
  });

  if (openingChestTier) {
    return (
      <ChestOpeningAnimation
        closedSrc={chestPath(`${openingChestTier}.svg`)}
        openedSrc={CHEST_OPENED_SPRITES[openingChestTier]}
        onComplete={() => setOpeningChestTier(null)}
      />
    );
  }

  if (chestLastResult) {
    return (
      <RewardsView
        dailyResult={null}
        chestResult={chestLastResult}
        hasOtherChest={hasOtherChest}
        rewardOptionIndex={rewardOptionIndex}
        rewardOptionCount={rewardOptionCount}
        lastOpened={lastOpened}
        onSelect={setRewardOptionIndex}
        onCloseDaily={() => undefined}
        onCloseChest={() => setLastResult(null)}
        onOpenNextChest={handleOpenNextChest}
      />
    );
  }

  const currencyCount = (totalCoins > 0 ? 1 : 0) + (totalHyperCoins > 0 ? 1 : 0);
  const totalUsed = items.length + currencyCount;
  const slotsLabel =
    maxSlots === Infinity ? `${totalUsed} / ∞` : `${totalUsed} / ${maxSlots}`;

  const listItems =
    filterType === "all"
      ? (Array.from({ length: maxSlots }, (_, i) => {
          if (i < CURRENCY_IDS.length) return currencyItems[i];
          return items[i - CURRENCY_IDS.length];
        }) as (typeof items)[number][])
      : filteredItems;

  return (
    <div className={`${styles.tabContent} ${styles.container}`}>
      <div className={styles.leftPanel}>
        <h3 className={styles.slotsLabel}>Inventário {slotsLabel}</h3>

        <FilterBar
          filterType={filterType}
          filterFocused={filterFocused}
          onFilterChange={setFilterType}
        />
      </div>

      <ul ref={listRef} className={styles.list}>
        {listItems.map((item, index) =>
          item ? (
            <ListItem
              key={index}
              item={item}
              isSelected={index === selectedIndex}
              rejected={index === rejectedIndex}
            />
          ) : (
            <li key={index} className="InventoryItem" />
          ),
        )}
      </ul>

      {dropItem && (
        <DropItem
          isOpen={!!dropItem}
          item={dropItem}
          onDrop={handleConfirmDrop}
          onClose={handleCloseDrop}
        />
      )}
    </div>
  );
}
