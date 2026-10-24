import type {
  AddItemOptions,
  InventoryItem,
} from "@/utils/types/player/inventory";

export type BaseDeps = {
  setPopup: (msg: string) => void;
};

export type InventoryDeps = BaseDeps & {
  hasItem: (id: ItemId) => boolean;
  addItem: (item: InventoryItem, options?: AddItemOptions) => void;
  removeItem: (id: ItemId) => void;
  /** Entrega item a NPC: remove do inventário e exibe toast. */
  giveItem: (id: ItemId, npcName?: string, qty?: number) => void;
  /** NPC entrega item ao jogador: adiciona ao inventário e exibe toast com imagem do NPC. */
  npcGiveItem: (itemId: ItemId, npcName: string, npcImage?: string) => void;
  navigate?: (path: string) => void;
};

export type PickupDeps = BaseDeps & {
  addItem: (item: InventoryItem, options?: AddItemOptions) => void;
  gotKey?: boolean;
  setFlag?: (flag: FlagId) => void;
};

export type QuestDeps = {
  progressQuest: (id: QuestId, step: number) => void;
};

export type ContainerDeps = BaseDeps & {
  openContainer: (container?: string) => void;
};

export type ToolDeps = BaseDeps & {
  hasToolEquipped: (toolId: EquipmentId) => boolean;
};

export type ImageDeps = BaseDeps & {
  /**
   * `music` é a trilha que toca enquanto o modal estiver aberto: a cena já
   * resolve a própria música, então o feature usa esse valor como override
   * do áudio da cena e volta a anterior quando o modal fecha.
   */
  showImage: (
    src: string,
    message?: string,
    name?: string,
    music?: string,
  ) => void;
};

export type MessageDeps = BaseDeps & {
  showMessageCard: (config: MessageCardConfig) => void;
};

export type MessageCardConfig = {
  title?: string;
  subtitle?: string;
  description?: string;
  // Lista numerada até N, sem texto: existe pra Manuscrito dos "pontos fracos"
  // de alguém que não tem ponto fraco algum — o número é o conteúdo.
  numberedCount?: number;
};

export type PickupHandlerConfig = {
  item: InventoryItem;
  flagId: FlagId;
  pickupMessage: string;
  alreadyPickedMessage?: string;
  questProgress?: { id: QuestId; step: number };
};

export type ExchangeHandlerConfig = {
  coord: string;
  requiredItem: ItemId;
  item: InventoryItem;
  successMessage: string;
  /** Nome do NPC para o toast de entrega (opcional). */
  npcName?: string;
};

export type ImageHandlerConfig = {
  src: string;
  message?: string;
  name?: string;
  /** Trilha que substitui a da cena enquanto o modal estiver aberto. */
  music?: string;
};

export type MessageHandlerConfig = MessageCardConfig;
