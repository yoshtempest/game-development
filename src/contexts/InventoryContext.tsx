import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AddItemOptions,
  InventoryItem,
} from "@/utils/types/player/inventory";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { useToast } from "@/contexts/ToastContext";
import type { SoundId } from "@/utils/audio/soundId";
import { INVENTORY_KEY } from "@/data/storageKeys";
import { ITEMS } from "@/data/items";
import { itemPath } from "@/utils/paths";
import { useCompressedStorage } from "@/hooks/useCompressedStorage";
import { useToggle } from "@/hooks/useToggle";
import { useQueuedSounds } from "@/hooks/audio/useQueuedSounds";
import { InventoryService } from "@/services/inventory";

type InventoryContextType = {
  items: InventoryItem[];

  addItem: (item: InventoryItem, options?: AddItemOptions) => boolean;
  removeItem: (id: ItemId, qty?: number) => void;
  /** Entrega item a um NPC: remove do inventário e exibe toast. */
  giveItem: (id: ItemId, npcName?: string, qty?: number) => void;
  /** NPC entrega item ao jogador: adiciona ao inventário e exibe toast com imagem do NPC. */
  npcGiveItem: (itemId: ItemId, npcName: string, npcImage?: string) => void;
  hasItem: (id: ItemId) => boolean;
  hasSpaceFor: (incoming: InventoryItem[]) => boolean;

  isOpen: boolean;
  openInventory: () => void;
  closeInventory: () => void;
  toggleInventory: () => void;
  setItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  maxSlots: number;
  setMaxSlots: (slots: number) => void;
};

const InventoryContext = createContext<InventoryContextType | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useCompressedStorage<InventoryItem[]>(
    INVENTORY_KEY,
    [],
  );
  const { playSound } = useSoundEffects();
  const { showToast } = useToast();

  const {
    isOpen,
    open: openInventory,
    close: closeInventory,
    toggle: toggleInventory,
  } = useToggle();

  const [maxSlots, setMaxSlots] = useState(20);

  const inventoryService = useMemo(
    () => new InventoryService(maxSlots),
    [maxSlots],
  );

  /**
   * Array mais recente da mochila, incluindo mutações desta mesma tick
   * que o `items` do render ainda não enxerga.
   *
   * Ele existe para que a regra rode fora do updater do `setItems`. Um
   * updater precisa ser puro: o React pode reexecutá-lo (StrictMode em
   * dev reexecuta sempre), então enfileirar som lá dentro duplica ou
   * perde evento. Com o ref carregando o resultado adiante, chamadas
   * encadeadas no mesmo tick — vários `addItem` de um baú, por exemplo —
   * continuam enxergando umas às outras.
   */
  const latestItemsRef = useRef(items);
  latestItemsRef.current = items;

  const { pushIf } = useQueuedSounds(playSound, items);

  const commit = useCallback(
    (next: InventoryItem[], sound: SoundId | null) => {
      latestItemsRef.current = next;
      pushIf(sound);
      setItems(next);
    },
    [setItems, pushIf],
  );

  const addItem = useCallback(
    (item: InventoryItem, options?: AddItemOptions): boolean => {
      const result = inventoryService.addItem(latestItemsRef.current, item);
      commit(result.items, result.sound);

      // Toast fora do updater, só quando o item realmente entrou (mochila
      // cheia não notifica). Só coleta no explore liga a flag — ver
      // AddItemOptions.
      if (options?.showToast && result.added) {
        const itemData = ITEMS[item.id];
        if (itemData) {
          const qty = item.qty ?? 1;
          showToast({
            icon: itemData.image ?? itemPath(`${item.id}.svg`),
            text: `Você pegou ${itemData.name}${qty > 1 ? ` x${qty}` : ""}!`,
          });
        }
      }

      return result.added;
    },
    [inventoryService, commit, showToast],
  );

  const removeItem = useCallback(
    (id: ItemId, qty = 1) => {
      const result = inventoryService.removeItem(
        latestItemsRef.current,
        id,
        qty,
      );
      commit(result.items, result.sound);
    },
    [inventoryService, commit],
  );

  /** Entrega item a NPC: remove do inventário e exibe toast. */
  const giveItem = useCallback(
    (id: ItemId, npcName = "um NPC", qty = 1) => {
      const itemData = ITEMS[id];
      const result = inventoryService.removeItem(
        latestItemsRef.current,
        id,
        qty,
      );
      commit(result.items, result.sound);
      if (result.removed && itemData) {
        showToast({
          icon: itemData.image ?? itemPath(`${id}.svg`),
          text: `Você entregou ${itemData.name} para ${npcName}.`,
        });
      }
    },
    [inventoryService, commit, showToast],
  );

  /** NPC entrega item ao jogador: adiciona ao inventário e exibe toast com imagem do NPC. */
  const npcGiveItem = useCallback(
    (itemId: ItemId, npcName: string, npcImage?: string) => {
      const itemData = ITEMS[itemId];
      const result = inventoryService.addItem(latestItemsRef.current, { id: itemId });
      commit(result.items, result.sound);
      if (result.added && itemData) {
        showToast({
          icon: npcImage ?? itemData.image ?? itemPath(`${itemId}.svg`),
          text: `${npcName} lhe entregou ${itemData.name}.`,
        });
      }
    },
    [inventoryService, commit, showToast],
  );

  const hasItem = useCallback(
    (id: ItemId) => items.some((item) => item.id === id),
    [items],
  );

  const hasSpaceFor = useCallback(
    (incoming: InventoryItem[]) =>
      inventoryService.hasSpaceFor(items, incoming),
    [inventoryService, items],
  );

  const value = useMemo(
    () => ({
      items,
      setItems,
      addItem,
      removeItem,
      giveItem,
      npcGiveItem,
      hasItem,
      hasSpaceFor,
      isOpen,
      openInventory,
      closeInventory,
      toggleInventory,
      maxSlots,
      setMaxSlots,
    }),
    [
      items,
      setItems,
      addItem,
      removeItem,
      giveItem,
      npcGiveItem,
      hasItem,
      hasSpaceFor,
      isOpen,
      openInventory,
      closeInventory,
      toggleInventory,
      maxSlots,
      setMaxSlots,
    ],
  );

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context)
    throw new Error("useInventory deve ser usado dentro do Provider");
  return context;
}
