import { Movement } from "@/components/Game/Controls/Movement";
import { Outlet, useLocation } from "react-router";
import { GameButtons } from "@/components/Game/Controls/GameButtons";
import { XPBarNotification } from "@/components/Game/Notification/XPBar";
import { HungerBarNotification } from "@/components/Game/Notification/HungerBar";
import { SleepBarNotification } from "@/components/Game/Notification/SleepBar";
import { XpProfessionNotification } from "@/components/Game/Notification/XpProfession";
import { StatusToasts } from "@/components/Game/Notification/StatusToasts";
import { ToastStack } from "@/components/Game/Notification/ToastStack";
import { CharacterUnlockModal } from "@/components/Game/Unlock/CharacterUnlockModal";
import { useInventory } from "@/contexts/InventoryContext";
import { useNavbar } from "@/contexts/NavbarContext";
import { Navbar } from "@/components/Game/Navbar/ExploreNavbar";

import { lazy, Suspense, useEffect, useRef } from "react";

const Inventory = lazy(() =>
  import("@/components/Game/Navbar/ExploreNavbar/Inventory").then((m) => ({
    default: m.Inventory,
  })),
);
import {
  loadGame,
  saveGame,
  saveGameToCloud,
  loadGameFromCloud,
} from "@/services/save/saveService";

import { useQuests } from "@/contexts/QuestContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useEquipment } from "@/contexts/EquipmentContext";
import { isCharacter } from "@/data/characters/list";
import { useAuth } from "@/contexts/AuthContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useHungerTimer } from "@/hooks/hunger/useHungerTimer";
import { useSleepTimer } from "@/hooks/sleep/useSleepTimer";
import { useRegenTimer } from "@/hooks/player/useRegenTimer";
import { useExploreLocation } from "@/hooks/scene/useExploreLocation";
import { CombatTutorialProvider } from "@/contexts/CombatTutorialContext";

export function GameApp() {
  const { isOpen } = useInventory();
  const { isNavOpen, isClosing } = useNavbar();
  const { items, setItems, setMaxSlots } = useInventory();
  const { setQuests, refreshDailyWeekly, quests } = useQuests();

  const { chooseClass, setCharacter, player, playerClass } = usePlayer();

  const { getEquippedItem } = useEquipment();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useHungerTimer();
  useSleepTimer();
  useRegenTimer();
  useExploreLocation();

  const prevRouteRef = useRef(location.pathname);
  const didSyncRef = useRef(false);

  useEffect(() => {
    const bag = getEquippedItem(player.character, "bag");
    const bonus = bag?.bonusSlots ?? 0;
    setMaxSlots(20 + bonus);
  }, [player.character, getEquippedItem, setMaxSlots]);

  // Sync from cloud on mount
  useEffect(() => {
    if (!isAuthenticated || didSyncRef.current) return;
    didSyncRef.current = true;

    void loadGameFromCloud().then((cloud) => {
      if (!cloud) return;
      setItems(cloud.inventory);
      setQuests(cloud.quests);
      if (cloud.playerClass) chooseClass(cloud.playerClass);
      if (cloud.character && isCharacter(cloud.character)) {
        setCharacter(cloud.character);
      }
    });
  }, [isAuthenticated, setItems, setQuests, chooseClass, setCharacter]);

  // Save on route change
  useEffect(() => {
    if (prevRouteRef.current === location.pathname) return;
    prevRouteRef.current = location.pathname;

    const skipRoutes = new Set(["/", "/home", "/tutorial"]);
    const lastRoute =
      skipRoutes.has(location.pathname) ||
      location.pathname.startsWith("/replay")
        ? (loadGame()?.lastRoute ?? "/jomasioEntrance")
        : location.pathname;

    const data = {
      lastRoute,
      inventory: items,
      quests,
      playerClass,
      character: player.character,
    };

    saveGame(data);
    if (isAuthenticated) {
      void saveGameToCloud(data);
    }
  }, [
    location.pathname,
    items,
    quests,
    playerClass,
    player.character,
    isAuthenticated,
  ]);

  const chooseClassRef = useLatestRef(chooseClass);
  const setCharacterRef = useLatestRef(setCharacter);
  const setItemsRef = useLatestRef(setItems);
  const setQuestsRef = useLatestRef(setQuests);
  const refreshDailyWeeklyRef = useLatestRef(refreshDailyWeekly);

  useEffect(() => {
    const save = loadGame();

    if (save) {
      setItemsRef.current(save.inventory);
      setQuestsRef.current(save.quests);
    }

    refreshDailyWeeklyRef.current();

    if (!save) return;

    if (save.playerClass) {
      chooseClassRef.current(save.playerClass);
    }

    if (save.character && isCharacter(save.character)) {
      setCharacterRef.current(save.character);
    }
  }, [
    chooseClassRef,
    refreshDailyWeeklyRef,
    setCharacterRef,
    setItemsRef,
    setQuestsRef,
  ]);

  return (
    <div className="app">
      <CombatTutorialProvider>
        <Movement />
        <Outlet />
        <GameButtons />
      </CombatTutorialProvider>
      <XPBarNotification />
      <HungerBarNotification />
      <SleepBarNotification />
      <XpProfessionNotification />
      <StatusToasts />
      <CharacterUnlockModal />
      <ToastStack />
      {isOpen && (
        <Suspense fallback={null}>
          <Inventory />
        </Suspense>
      )}
      {(isNavOpen || isClosing) && (
        <div className="navbarClip">
          <Navbar />
        </div>
      )}
    </div>
  );
}
