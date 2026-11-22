import { useCallback, useEffect, useRef, useState } from "react";
import { Equipment } from "@/components/Game/Navbar/ExploreNavbar/Equipment";
import { useInventoryTabs } from "@/hooks/menu/useInventoryTabs";
import { useDailyChest } from "@/hooks/chest/useDailyChest";
import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import { useRewardsControls } from "@/hooks/menu/rewardsControls/useRewardsControls";
import { useStableCallback } from "@/hooks/useStableCallback";
import {
  INVENTORY_SECTIONS,
  INVENTORY_SECTION_ICONS,
  INVENTORY_SECTION_LABELS,
  type InventorySection,
} from "@/data/inventory/tabs";
import {
  DAILY_CHEST_CLOSED_SPRITE,
  DAILY_CHEST_OPENED_SPRITE,
} from "@/data/items/chests/chestItems";
import { InventoryTab } from "./InventoryTab";
import { Chest } from "./Chest";
import { ChestOpeningAnimation } from "./ChestOpeningAnimation";
import { RewardsView } from "./RewardsView";
import styles from "./styles.module.css";

type Props = {
  initialSection: InventorySection;
};

/**
 * A Mochila é o dono do baú diário: ele fica no cabeçalho, à direita das abas,
 * e por isso acompanha o jogador tanto no Inventário quanto em Equipamentos.
 */
function InventoryMenu({ initialSection }: Props) {
  const dailyChest = useDailyChest();
  const { playMove, playSelect } = useMenuSFX();

  const [dailyOpening, setDailyOpening] = useState(false);
  const [dailyRewardIndex, setDailyRewardIndex] = useState(0);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    };
  }, []);

  const showPopup = useCallback((message: string) => {
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    setPopupMessage(message);
    popupTimerRef.current = setTimeout(() => setPopupMessage(null), 2000);
  }, []);

  const handleOpenDailyChest = useCallback(() => {
    const outcome = dailyChest.open();
    if (outcome.status === "opened") {
      setDailyOpening(true);
    } else if (outcome.status === "inventoryFull") {
      showPopup("Mochila cheia");
    }
  }, [dailyChest, showPopup]);

  const closeDailyRewards = useStableCallback(() =>
    dailyChest.setLastResult(null),
  );

  const dailyRewardsVisible = !!dailyChest.lastResult && !dailyOpening;
  const dailyOverlayVisible = dailyOpening || dailyRewardsVisible;

  useRewardsControls({
    isActive: dailyRewardsVisible,
    chestRewardsVisible: dailyRewardsVisible,
    rewardOptionCount: 1,
    lastOpened: null,
    playMove,
    playSelect,
    closeRewards: closeDailyRewards,
    openNextChest: () => undefined,
    onRewardOptionChange: setDailyRewardIndex,
  });

  const {
    activeSection,
    isOnTab,
    isChestFocused,
    isContentActive,
    setActiveSection,
    focusTab,
    enterContent,
    focusChest,
  } = useInventoryTabs(
    initialSection,
    dailyChest.isReady,
    handleOpenDailyChest,
  );

  // Enquanto a animação/recompensa do baú está na tela, as layers das abas
  // ficam inativas para não disputar o input com o overlay.
  const isContentReady = isContentActive && !dailyOverlayVisible;

  return (
    <div className="containerOfNavbar">
      <div className={styles.header}>
        <div className="tabs">
          {INVENTORY_SECTIONS.map((section) => {

            return (
              <button
                key={section}
                type="button"
                className={`tab ${activeSection === section ? "tabActive" : ""}
                  ${isOnTab && activeSection === section ? "tabSelected" : ""}`}
                onClick={() => {
                  setActiveSection(section);
                  enterContent();
                }}
              >
                <img src={INVENTORY_SECTION_ICONS[section]} className={styles.image}/>
                <span>{INVENTORY_SECTION_LABELS[section]}</span>
              </button>
            );
          })}
        </div>

        <Chest
          isFocused={isChestFocused}
          isReady={dailyChest.isReady}
          timeLeft={dailyChest.timeLeft}
          onOpen={handleOpenDailyChest}
        />
      </div>

      <div
        className={`${styles.contentWrapper} ${
          dailyOverlayVisible ? styles.hiddenContent : ""
        }`}
      >
        {activeSection === "inventario" ? (
          <InventoryTab
            isActive={isContentReady}
            chestReady={dailyChest.isReady}
            onFocusChest={focusChest}
            onFocusTabs={focusTab}
            onPopup={showPopup}
          />
        ) : (
          <Equipment isActive={isContentReady} onFocusTabs={focusTab} />
        )}
      </div>

      {dailyOpening && (
        <ChestOpeningAnimation
          closedSrc={DAILY_CHEST_CLOSED_SPRITE}
          openedSrc={DAILY_CHEST_OPENED_SPRITE}
          onComplete={() => setDailyOpening(false)}
        />
      )}

      {dailyRewardsVisible && (
        <RewardsView
          dailyResult={dailyChest.lastResult}
          chestResult={null}
          hasOtherChest={false}
          rewardOptionIndex={dailyRewardIndex}
          rewardOptionCount={1}
          lastOpened={null}
          onSelect={setDailyRewardIndex}
          onCloseDaily={closeDailyRewards}
          onCloseChest={() => undefined}
          onOpenNextChest={() => undefined}
        />
      )}

      {popupMessage && <div className={styles.noKeyPopup}>{popupMessage}</div>}
    </div>
  );
}

export function Inventory() {
  return <InventoryMenu initialSection="inventario" />;
}

export function InventoryEquipment() {
  return <InventoryMenu initialSection="equipamentos" />;
}
