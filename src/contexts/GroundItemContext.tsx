import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { GROUND_ITEMS_KEY } from "@/data/storageKeys";
import { useCompressedStorage } from "@/hooks/useCompressedStorage";

type ContextType = {
  addLoot: (
    locationId: string,
    x: number,
    y: number,
    items: GroundItem[],
  ) => void;
  removeItem: (
    locationId: string,
    x: number,
    y: number,
    itemId: ItemId,
  ) => void;
  collectAll: (locationId: string, x: number, y: number) => GroundItem[];
  getLootAt: (locationId: string) => GroundLoot[];
  clearAll: (locationId: string) => void;
  currentLocationId: string | null;
  setCurrentLocationId: (id: string | null) => void;
};

function lootKey(locationId: string, x: number, y: number): string {
  return `${locationId}:${x}:${y}`;
}

const GroundItemContext = createContext<ContextType | null>(null);

const FOOD_PLATE_SPOIL_MS = 60_000; // 1 minuto
const SPOIL_CHECK_INTERVAL_MS = 5_000; // Verifica a cada 10s

export function GroundItemProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useCompressedStorage<GroundItemsSaveData>(
    GROUND_ITEMS_KEY,
    {},
  );

  const dataRef = useRef(data);
  dataRef.current = data;

  const [currentLocationId, setCurrentLocationId] = useState<string | null>(
    null,
  );

  // Spoilage check: converte foodPlate para spoiledFoodPlate após 1 minuto no chão
  useEffect(() => {
    const checkSpoilage = () => {
      setData((prev) => {
        let changed = false;
        const next = { ...prev };

        for (const key of Object.keys(next)) {
          const loot = next[key];
          if (!loot) continue;

          const hasSpoiledFood = loot.items.some(
            (item) => item.id === "foodPlate" && item.droppedAt && Date.now() - item.droppedAt >= FOOD_PLATE_SPOIL_MS
          );

          if (hasSpoiledFood) {
            changed = true;
            next[key] = {
              ...loot,
              items: loot.items.map((item) =>
                item.id === "foodPlate" && item.droppedAt && Date.now() - item.droppedAt >= FOOD_PLATE_SPOIL_MS
                  ? { ...item, id: "spoiledFoodPlate" }
                  : item
              ),
            };
          }
        }

        return changed ? next : prev;
      });
    };

    const interval = setInterval(checkSpoilage, SPOIL_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [setData]);

  const addLoot = useCallback(
    (locationId: string, x: number, y: number, items: GroundItem[]) => {
      const key = lootKey(locationId, x, y);
      setData((prev) => {
        const existing = prev[key];
        if (existing) {
          const merged = existing.items.map((item) => ({ ...item }));
          for (const item of items) {
            const found = merged.find((m) => m.id === item.id);
            if (found) {
              found.qty += item.qty;
            } else {
              merged.push({ ...item });
            }
          }
          return { ...prev, [key]: { locationId, x, y, items: merged } };
        }
        return {
          ...prev,
          [key]: { locationId, x, y, items: items.map((i) => ({ ...i })) },
        };
      });
    },
    [setData],
  );

  const removeItem = useCallback(
    (locationId: string, x: number, y: number, itemId: ItemId) => {
      const key = lootKey(locationId, x, y);
      setData((prev) => {
        const loot = prev[key];
        if (!loot) return prev;
        const next = loot.items
          .map((item) =>
            item.id === itemId ? { ...item, qty: item.qty - 1 } : item,
          )
          .filter((item) => item.qty > 0);
        if (next.length === 0) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [key]: _removed, ...rest } = prev;
          return rest;
        }
        return { ...prev, [key]: { ...loot, items: next } };
      });
    },
    [setData],
  );

  const collectAll = useCallback(
    (locationId: string, x: number, y: number): GroundItem[] => {
      const key = lootKey(locationId, x, y);
      const loot = dataRef.current[key];
      if (!loot) return [];
      setData((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [key]: _removed, ...rest } = prev;
        return rest;
      });
      return loot.items.map((item) => ({ ...item }));
    },
    [setData],
  );

  const getLootAt = useCallback(
    (locationId: string): GroundLoot[] => {
      return Object.values(data).filter(
        (loot) => loot.locationId === locationId,
      );
    },
    [data],
  );

  const clearAll = useCallback(
    (locationId: string) => {
      setData((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          if (key.startsWith(`${locationId}:`)) {
            delete next[key];
          }
        }
        return next;
      });
    },
    [setData],
  );

  const value = useMemo(
    () => ({
      addLoot,
      removeItem,
      collectAll,
      getLootAt,
      clearAll,
      currentLocationId,
      setCurrentLocationId,
    }),
    [
      addLoot,
      removeItem,
      collectAll,
      getLootAt,
      clearAll,
      currentLocationId,
      setCurrentLocationId,
    ],
  );

  return (
    <GroundItemContext.Provider value={value}>
      {children}
    </GroundItemContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGroundItems() {
  const ctx = useContext(GroundItemContext);
  if (!ctx) throw new Error("useGroundItems precisa do GroundItemProvider");
  return ctx;
}
