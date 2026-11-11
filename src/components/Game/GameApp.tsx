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
import { useOnline } from "@/contexts/OnlineContext";
import { useBattleSocket } from "@/hooks/useBattleSocket";
import { useNavigate } from "react-router";
import { useEquipment } from "@/contexts/EquipmentContext";
import { isCharacter } from "@/data/characters/list";
import { ROUTE_TO_BATTLE_KEY } from "@/data/battle/config";
import { useAuth } from "@/contexts/AuthContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useHungerTimer } from "@/hooks/hunger/useHungerTimer";
import { useSleepTimer } from "@/hooks/sleep/useSleepTimer";
import { useRegenTimer } from "@/hooks/player/useRegenTimer";
import { useExploreLocation } from "@/hooks/scene/useExploreLocation";
import { CombatTutorialProvider } from "@/contexts/CombatTutorialContext";
import { SocialOverlay } from "@/components/Game/Social/SocialOverlay";

export function GameApp() {
  const { isOpen } = useInventory();
  const { isNavOpen, isClosing } = useNavbar();
  const { items, setItems, setMaxSlots } = useInventory();
  const { setQuests, refreshDailyWeekly, quests } = useQuests();

  const { chooseClass, setCharacter, player, playerClass } = usePlayer();
  const online = useOnline();
  const { connected, updateState } = online;
  const {
    send: socketSend,
    lastMessage: socketLast,
    connected: socketConnected,
  } = useBattleSocket(online.roomId, online.playerId);
  const navigate = useNavigate();
  const lastBattleRouteRef = useRef<string | null>(null);

  const { getEquippedItem } = useEquipment();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useHungerTimer();
  useSleepTimer();
  useRegenTimer();
  useExploreLocation();

  useEffect(() => {
    if (!connected) return;
    updateState({
      scene: location.pathname,
      x: player.gridX,
      y: player.gridY,
      character: player.character,
      direction: player.direction,
      moving: player.moving ?? false,
      hasPeru: player.hasPeru ?? false,
    });
  }, [
    connected,
    location.pathname,
    player.gridX,
    player.gridY,
    player.character,
    player.direction,
    player.hasPeru,
    player.moving,
    updateState,
  ]);

  // Co-op de guilda: o líder anuncia a batalha só para o parceiro
  // (`online.guildId`). PvP e treino continuam 1v1 e não passam por aqui.
  const guildMate = online.room?.players.find((p) => p.id === online.guildId);

  useEffect(() => {
    const path = location.pathname;
    const battleKey = ROUTE_TO_BATTLE_KEY[path];
    const isCoopBattle =
      battleKey !== undefined && battleKey !== "pvp" && battleKey !== "training";

    if (!isCoopBattle) {
      lastBattleRouteRef.current = null;
      return;
    }
    if (!connected || !socketConnected || !guildMate) return;
    // Quem chegou como convidado (state.battleLeaderId) não reanuncia.
    if ((location.state as { battleLeaderId?: string } | null)?.battleLeaderId) {
      return;
    }
    if (lastBattleRouteRef.current === path) return;
    lastBattleRouteRef.current = path;
    socketSend({
      type: "battleStart",
      route: path,
      from: online.playerId,
      to: guildMate.id,
      state: location.state ?? null,
    });
  }, [
    connected,
    socketConnected,
    guildMate,
    location.pathname,
    location.state,
    online.playerId,
    socketSend,
  ]);

  // Seguidor: navega só quando o anúncio veio do parceiro de guilda e é
  // endereçado a ele. O líder vai no state para a autoridade do co-op.
  useEffect(() => {
    if (!connected || !online.guildId) return;
    if (socketLast?.type !== "battleStart") return;
    const from = socketLast.from as string | undefined;
    const to = socketLast.to as string | undefined;
    const route = socketLast.route as string | undefined;
    if (!route || to !== online.playerId || from !== online.guildId) return;
    if (route === location.pathname) return;
    const state =
      socketLast.state && typeof socketLast.state === "object"
        ? (socketLast.state as Record<string, unknown>)
        : {};
    void navigate(route, { state: { ...state, battleLeaderId: from } });
  }, [
    connected,
    online.guildId,
    online.playerId,
    socketLast,
    location.pathname,
    navigate,
  ]);

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
        <SocialOverlay />
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
