import { rootAssetPath } from "@/utils/paths";
import { useRef } from "react";
import { useSaveMenu } from "@/hooks/menu/useSave";
import { isSlotUsed } from "@/services/save/slotManager";
import {
  loadGameForSlot,
  getPlayTimeForSlot,
} from "@/services/save/saveService";
import { getSceneImage, getSceneLabel } from "@/utils/sceneImages";
import { formatTime } from "@/utils/formatDuration";
import { ReplayList } from "@/components/Game/Navbar/ExploreNavbar/Saves/ReplayList";
import { SAVE_TABS, SAVE_TAB_LABELS } from "@/data/saves/tabs";
import styles from "./styles.module.css";

export function Saves() {
  const listRef = useRef<HTMLDivElement>(null);
  const {
    confirmDelete,
    selectedIndex,
    items,
    activeSlot,
    activeTab,
    isOnTab,
  } = useSaveMenu(listRef);
  if (confirmDelete !== "none") {
    const confirmItems = ["Sim, excluir", "Não, voltar"];
    return (
      <div className="containerOfNavbar">
        <h2 className={styles.title}>Excluir Save {confirmDelete.slot + 1}?</h2>
        <div className={styles.actionList}>
          {confirmItems.map((label, i) => (
            <div
              key={label}
              className={`${styles.action} ${selectedIndex === i ? styles.selected : ""} ${i === 0 ? styles.actionDanger : ""}`}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`containerOfNavbar ${styles.center}`}>
      <div className="tabs">
        {SAVE_TABS.map((tab) => (
          <button
            key={tab}
            className={`${"tab"} ${activeTab === tab ? "tabActive" : ""} ${isOnTab && activeTab === tab ? "tabSelected" : ""}`}
          >
            {SAVE_TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {activeTab === "saves" && (
        <div ref={listRef} className={styles.itemList}>
          {items.map((item, i) => {
            const isSelected = selectedIndex === i;
            const isSlot = item.key.startsWith("slot-");

            if (isSlot && item.slot !== undefined) {
              const slot = item.slot;
              const used = isSlotUsed(slot);
              const isActive = slot === activeSlot;
              const save = used ? loadGameForSlot(slot) : null;
              const sceneImage = save?.lastRoute
                ? getSceneImage(save.lastRoute)
                : rootAssetPath("logo.svg");
              const sceneLabel = save?.lastRoute
                ? getSceneLabel(save.lastRoute)
                : "Sem progresso";
              const playTime = used ? getPlayTimeForSlot(slot) : 0;

              return (
                <div
                  key={item.key}
                  className={`${styles.slotCard} ${isSelected ? styles.selected : ""} ${isActive ? styles.active : ""}`}
                >
                  <img loading="lazy" decoding="async" src={sceneImage} alt="" className={styles.sceneImage} />
                  <div className={styles.slotInfo}>
                    <span className={styles.slotLabel}>
                      Save {slot + 1}
                      {isActive && (
                        <span className={styles.activeBadge}> &gt; Ativo</span>
                      )}
                    </span>
                    {used ? (
                      <>
                        <span className={styles.sceneLabel}>{sceneLabel}</span>
                        <span className={styles.playTime}>
                          {formatTime(playTime)}
                        </span>
                      </>
                    ) : (
                      <span className={styles.emptyLabel}>Vazio</span>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.key}
                className={`${styles.action} ${isSelected ? styles.selected : ""} ${item.danger ? styles.actionDanger : ""} ${item.key === "back" ? styles.backAction : ""}`}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "replays" && <ReplayList isOnTab={isOnTab} />}
    </div>
  );
}
