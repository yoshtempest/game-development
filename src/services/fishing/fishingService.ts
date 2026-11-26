import type { InventoryService } from "@/services/inventory";

import { rollFishing } from "@/gameRules/professions/fishing";
import type { FishingRoll } from "@/gameRules/professions/fishing";

import type { BaitId } from "@/data/professions/baits";
import type { InventoryItem } from "@/utils/types/player/inventory";

export type FishingCastInput = {
  items: InventoryItem[];
  baitId: BaitId | null;
  rodId: string | null;
  now: Date;
};

export type FishingCastResult = FishingRoll & {
  /** Mochila depois de gastar a isca; igual à de entrada sem isca. */
  items: InventoryItem[];
  /** Isca que de fato valeu na rolagem (null se não havia na mochila). */
  usedBaitId: BaitId | null;
  sound: SoundId | null;
};

/**
 * Arremesso da vara: gasta uma isca e rola o resultado.
 *
 * A isca só vale se existir na mochila. Sem essa checagem, um seletor de UI
 * desatualizado (isca acabou no arremesso anterior) daria a garantia de
 * batalha/recurso de graça. A remoção passa pelo `InventoryService` para
 * manter pilha e som no mesmo lugar que o resto da mochila.
 */
export class FishingService {
  private readonly inventory: InventoryService;
  private readonly random: () => number;

  constructor(inventory: InventoryService, random: () => number = Math.random) {
    this.inventory = inventory;
    this.random = random;
  }

  cast(input: FishingCastInput): FishingCastResult {
    let items = input.items;
    let usedBaitId: BaitId | null = null;
    let sound: SoundId | null = null;

    if (input.baitId && items.some((i) => i.id === input.baitId)) {
      const removal = this.inventory.removeItem(items, input.baitId);
      items = removal.items;
      sound = removal.sound;
      usedBaitId = removal.removed ? input.baitId : null;
    }

    const roll = rollFishing({
      baitId: usedBaitId,
      rodId: input.rodId,
      now: input.now,
      random: this.random,
    });

    return { ...roll, items, usedBaitId, sound };
  }
}
