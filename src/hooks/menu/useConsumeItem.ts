import { useRef } from "react";
import { useInventory } from "@/contexts/InventoryContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useCharacterProgress } from "@/contexts/CharacterProgressContext";
import { MAX_HUNGER } from "@/data/player/hunger";
import { MAX_SLEEP } from "@/data/player/sleep";
import { useBattleMana } from "@/contexts/BattleManaContext";
import { useAudio } from "@/hooks/audio/useAudio";
import { useLatestRef } from "@/hooks/useLatestRef";
import { sfx } from "@/utils/paths";
import { activateXpBuff, POTION_CONFIG } from "@/utils/buffs/xpBuff";
import {
  FOOD_RESTORE,
  ENERGETIC_RESTORE,
  MANA_RESTORE,
} from "@/services/items/itemEffects";

/**
 * Consuming an item from the inventory.
 *
 * The returned `consumeItem` reports whether the item was actually used, so
 * the caller can reject the input instead of destroying an item that does
 * nothing. An item typed `food` or `consumable` with no `FOOD_RESTORE` amount
 * and no `POTION_CONFIG` entry — `goat_meat` is one, and it is a unique
 * flag-gated pickup — used to be removed from the inventory with no effect at
 * all, which lost it permanently.
 */
export function useConsumeItem() {
  const { removeItem } = useInventory();
  const { player } = usePlayer();
  const { progress, restoreHunger, restoreSleep } = useCharacterProgress();
  const { sfxVolume } = useAudio();
  const battleMana = useBattleMana();

  const sfxVolumeRef = useLatestRef(sfxVolume);

  const consumeItemRef = useRef<(id: string) => boolean>(() => false);
  consumeItemRef.current = function consumeItem(id: string) {
    const foodAmount = FOOD_RESTORE[id];
    const potion = POTION_CONFIG[id];
    const energetic = ENERGETIC_RESTORE[id];
    const manaAmount = MANA_RESTORE[id];
    if (!foodAmount && !potion && !energetic && !manaAmount) return false;

    if (foodAmount) {
      const currentHunger = progress[player.character]?.hunger ?? 0;
      if (currentHunger >= MAX_HUNGER) return false;
      restoreHunger(player.character, foodAmount);
    }

    if (energetic) {
      const charProgress = progress[player.character];
      const currentSleep = charProgress?.sleep ?? 0;
      const currentHunger = charProgress?.hunger ?? 0;
      if (currentSleep >= MAX_SLEEP && currentHunger >= MAX_HUNGER)
        return false;
      restoreSleep(player.character, energetic.sleep);
      restoreHunger(player.character, energetic.hunger);
    }

    if (manaAmount) {
      if (!battleMana || player.character === "natsuki") return false;
      battleMana.restoreMana(manaAmount);
    }

    const audio = sfx(
      foodAmount ? "/player/eating.mp3" : "/player/drinkingPotion.mp3",
    );
    audio.volume = 0.6 * (sfxVolumeRef.current / 100);
    audio.play().catch(() => {});

    if (potion) {
      activateXpBuff(potion.durationMs, potion.multiplier, id);
    }
    removeItem(id as ItemId);
    return true;
  };

  return { consumeItemRef };
}
