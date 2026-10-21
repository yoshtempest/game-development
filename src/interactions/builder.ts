import type {
  BaseDeps,
  PickupDeps,
  InventoryDeps,
  QuestDeps,
  PickupHandlerConfig,
  ExchangeHandlerConfig,
  ContainerDeps,
  ToolDeps,
  ImageDeps,
  ImageHandlerConfig,
  MessageDeps,
  MessageHandlerConfig,
} from "@/utils/types/interaction";

export function createInteractionMap<TDeps extends BaseDeps>(
  messages: Record<string, string>,
  deps: TDeps,
  custom?: Record<string, (deps: TDeps) => void>,
) {
  const interactions: Record<string, () => void> = Object.fromEntries(
    Object.entries(messages).map(([key, message]) => [
      key,
      () => deps.setPopup(message),
    ]),
  );

  if (custom) {
    for (const key in custom) {
      const handler = custom[key]!;
      interactions[key] = () => handler(deps);
    }
  }

  return interactions;
}

type PickupHandlerDeps = PickupDeps & Partial<QuestDeps>;

export function createPickupHandler(config: PickupHandlerConfig) {
  return (deps: PickupHandlerDeps) => {
    if (!deps.gotKey) {
      deps.setPopup(config.pickupMessage);
      deps.addItem(config.item, { showToast: true });
      if (config.questProgress) {
        deps.progressQuest?.(
          config.questProgress.id,
          config.questProgress.step,
        );
      }
      deps.setFlag?.(config.flagId);
    } else {
      deps.setPopup(config.alreadyPickedMessage ?? "Nada mais aqui.");
    }
  };
}

type ExchangeHandlerDeps = PickupDeps & InventoryDeps;

export function createExchangeHandler(config: ExchangeHandlerConfig) {
  return (deps: ExchangeHandlerDeps) => {
    if (deps.hasItem(config.requiredItem)) {
      deps.setPopup(config.successMessage);
      deps.giveItem(config.requiredItem, config.npcName);
      deps.addItem(config.item);
    }
  };
}

export function createContainerHandler() {
  return (deps: ContainerDeps) => {
    deps.openContainer();
  };
}

export function createToolInteraction<TDeps extends ToolDeps>(
  toolId: EquipmentId,
  blockedMessage: string,
  onUse: (deps: TDeps) => void,
) {
  return (deps: TDeps) => {
    if (!deps.hasToolEquipped(toolId)) {
      deps.setPopup(blockedMessage);
      return;
    }
    onUse(deps);
  };
}

export function createImageHandler<TDeps extends ImageDeps>(
  config: ImageHandlerConfig,
) {
  return (deps: TDeps) => {
    deps.showImage(config.src, config.message, config.name, config.music);
  };
}

export function createMessageCardHandler<TDeps extends MessageDeps>(
  config: MessageHandlerConfig,
) {
  return (deps: TDeps) => {
    deps.showMessageCard(config);
  };
}
