import { useRef } from "react";
import { useInventory } from "@/contexts/InventoryContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useCharacterProgress } from "@/contexts/CharacterProgressContext";
import { getHungerMultiplier, MAX_HUNGER } from "@/data/player/hunger";
import { MAX_SLEEP } from "@/data/player/sleep";
import { useBattleMana } from "@/contexts/BattleManaContext";
import { useBattleHealth } from "@/contexts/BattleHealthContext";
import { useTitles } from "@/contexts/TitleContext";
import { computeMaxHp } from "@/gameRules/battle/entities/player";
import { getEquipmentStatsBonus } from "@/gameRules/battle/equipment";
import { getRankMultiplier } from "@/gameRules/rank";
import { grantStatusResistance } from "@/gameRules/battle/status/statusEffects";
import { useAudio } from "@/hooks/audio/useAudio";
import { useLatestRef } from "@/hooks/useLatestRef";
import { sfx } from "@/utils/paths";
import { activateXpBuff, POTION_CONFIG } from "@/utils/buffs/xpBuff";
import {
  FOOD_RESTORE,
  ENERGETIC_RESTORE,
  MANA_RESTORE,
  HEAL_RESTORE,
  STATUS_RESISTANCE,
  STATUS_RESISTANCE_DURATION_MS,
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
 *
 * Poção de cura (`HEAL_RESTORE`) cura a vida da batalha via
 * `BattleHealthContext` quando há batalha montada, e o `battleHP` salvo do
 * personagem na exploração; com a vida cheia é recusada. Poção de resistência
 * (`STATUS_RESISTANCE`) nunca é recusada: mesmo sem status ativo ela vale
 * como prevenção, porque concede a imunidade.
 */
export function useConsumeItem() {
  const { removeItem } = useInventory();
  const { player, setPlayer } = usePlayer();
  const { progress, restoreHunger, restoreSleep, setBattleHP } =
    useCharacterProgress();
  const { getBonus } = useTitles();
  const { sfxVolume } = useAudio();
  const battleMana = useBattleMana();
  const battleHealth = useBattleHealth();

  function healExplore(ratio: number): boolean {
    const charProgress = progress[player.character];
    const currentHp = charProgress?.battleHP;
    if (!charProgress || currentHp == null) return false;
    const titleBonus = getBonus();
    const maxHp = computeMaxHp(
      charProgress.stats.resistance,
      getEquipmentStatsBonus(player.character).hp,
      titleBonus.hp,
      titleBonus.percentAllStats,
      getRankMultiplier(charProgress.level),
      getHungerMultiplier(charProgress.hunger),
    );
    if (currentHp >= maxHp) return false;
    const next = currentHp + Math.round(maxHp * ratio);
    setBattleHP(player.character, next >= maxHp ? null : next);
    return true;
  }

  const sfxVolumeRef = useLatestRef(sfxVolume);

  const consumeItemRef = useRef<(id: string) => boolean>(() => false);
  consumeItemRef.current = function consumeItem(id: string) {
    const foodAmount = FOOD_RESTORE[id];
    const potion = POTION_CONFIG[id];
    const energetic = ENERGETIC_RESTORE[id];
    const manaAmount = MANA_RESTORE[id];
    const healRatio = HEAL_RESTORE[id];
    const resistance = STATUS_RESISTANCE[id];
    if (
      !foodAmount &&
      !potion &&
      !energetic &&
      !manaAmount &&
      !healRatio &&
      !resistance
    )
      return false;

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

    if (healRatio) {
      const healed = battleHealth
        ? battleHealth.healByRatio(healRatio)
        : healExplore(healRatio);
      if (!healed) return false;
    }

    if (resistance) {
      setPlayer((p) =>
        grantStatusResistance(p, resistance, STATUS_RESISTANCE_DURATION_MS),
      );
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
