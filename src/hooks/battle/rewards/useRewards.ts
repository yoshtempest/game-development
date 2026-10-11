import { usePlayer } from "@/contexts/PlayerContext";
import { useCharacterProgress } from "@/contexts/CharacterProgressContext";
import { usePetProgress } from "@/contexts/PetProgressContext";
import { useEquipment } from "@/contexts/EquipmentContext";
import { useInventory } from "@/contexts/InventoryContext";
import { useQuests } from "@/contexts/QuestContext";
import { useSettings } from "@/hooks/settings/useSetting";
import { useFlags } from "@/contexts/FlagContext";
import { useTitles } from "@/contexts/TitleContext";
import { CHEST_DROP_CHANCE, KEY_DROP_CHANCE } from "@/data/battle/drops";
import { calculateXP } from "@/gameRules/battle/calculateXp";
import {
  PET_XP_MULTIPLIER,
  petStarsFromEnhance,
} from "@/data/characters/pets/petProgress";
import {
  getUnlockedCharacters,
  distributeSharedXp,
} from "@/gameRules/rewards/sharedXp";
import {
  rollEquipmentDrops,
  rollMaterialDrops,
  rollChestDrop,
  rollKeyDrop,
  rollPetDrop,
  rollNpcCardDrop,
} from "./drops";
import { buildLootBags } from "@/gameRules/battle/loot/buildLootBags";
import { getCoinReward } from "@/data/battle/lootbags";
import type { LootBagContents } from "@/utils/types/battle/loot";
import type { InventoryItem } from "@/utils/types/player/inventory";

function rollMultiple<T>(rollFn: () => T, rolls: number): T[] {
  const results: T[] = [];
  for (let i = 0; i < rolls; i++) {
    results.push(rollFn());
  }
  return results;
}

export type { EquipmentDropInfo };

type Props = {
  npcClass: NPCClass;
  npcLevel: number;
  npcType: string;
  luckBonus: number;
  isAlfa?: boolean;
};

export function useBattleRewards({
  npcClass,
  npcLevel,
  npcType,
  luckBonus,
  isAlfa = false,
}: Props) {
  const { player } = usePlayer();
  const { addXP, addCoins, addHyperCoins } = useCharacterProgress();
  const { addPetXP } = usePetProgress();
  const { getEquippedInfo, addDrop } = useEquipment();
  const { addItem } = useInventory();
  const { progressDailyWeekly } = useQuests();
  const { sharedXp } = useSettings();
  const { hasFlag } = useFlags();
  const { getPetDropBonus } = useTitles();

  const xpReward = (calculateXP(npcLevel, npcClass) ?? 0) * (isAlfa ? 3 : 1);
  const coinReward: number = getCoinReward(npcClass, npcLevel);
  const dropRolls = isAlfa ? 2 : 1;

  function collectEquipmentDrops(
    grantAddDrop: (
      character: CharacterId,
      id: EquipmentId,
      enhance?: number,
    ) => void,
  ) {
    const equipmentDrops: EquipmentDropInfo[] = rollMultiple(
      () =>
        rollEquipmentDrops(npcClass, grantAddDrop, player.character, luckBonus),
      dropRolls,
    ).flat();

    if (Math.random() < luckBonus) {
      equipmentDrops.push(
        ...rollEquipmentDrops(npcClass, grantAddDrop, player.character, 0),
      );
    }

    return equipmentDrops;
  }

  function collectMaterialDrops(
    grantAddItem: (item: InventoryItem) => boolean,
  ) {
    const itemDrops: ItemDropInfo[] = [];

    for (const drop of rollMultiple(
      () => rollMaterialDrops(npcClass, npcType, grantAddItem),
      dropRolls,
    ).flat()) {
      const existing = itemDrops.find((d) => d.id === drop.id);
      if (existing) {
        existing.qty += drop.qty;
      } else {
        itemDrops.push({ ...drop });
      }
    }

    return itemDrops;
  }

  function collectChestAndKeyDrops(
    grantAddItem: (item: InventoryItem) => boolean,
  ) {
    let chestDrop: ChestKeyDropInfo | null = null;
    let keyDrop: ChestKeyDropInfo | null = null;

    rollMultiple(() => {
      if (!chestDrop) {
        chestDrop = rollChestDrop(
          npcClass,
          grantAddItem,
          CHEST_DROP_CHANCE[npcClass],
        );
      }
      if (!keyDrop) {
        keyDrop = rollKeyDrop(
          npcClass,
          grantAddItem,
          KEY_DROP_CHANCE[npcClass],
        );
      }
      return null;
    }, dropRolls);

    return { chestDrop, keyDrop };
  }

  function collectPetDrop(
    grantAddDrop: (
      character: CharacterId,
      id: EquipmentId,
      enhance?: number,
    ) => void,
  ) {
    let petDrop: EquipmentDropInfo | null = null;
    const petDropBonus = getPetDropBonus();

    rollMultiple(() => {
      if (!petDrop)
        petDrop = rollPetDrop(
          npcType,
          grantAddDrop,
          player.character,
          petDropBonus,
        );
      return petDrop;
    }, dropRolls);

    return petDrop;
  }

  function collectCardDrop(grantAddItem: (item: InventoryItem) => boolean) {
    let cardDrop: ItemDropInfo | null = null;

    rollMultiple(() => {
      if (!cardDrop) cardDrop = rollNpcCardDrop(npcType, grantAddItem);
      return cardDrop;
    }, dropRolls);

    return cardDrop;
  }

  function giveXp(amount: number) {
    if (sharedXp) {
      const unlocked = getUnlockedCharacters(hasFlag);
      const distribution = distributeSharedXp(
        amount,
        player.character,
        unlocked,
      );
      for (const [character, xp] of Object.entries(distribution)) {
        if (xp > 0) addXP(character as CharacterId, xp);
      }
      return;
    }

    addXP(player.character, amount);
  }

  function givePetXp() {
    const petInfo = getEquippedInfo(player.character, "pet");
    if (!petInfo) return;
    const petXpAmount = Math.floor(xpReward * PET_XP_MULTIPLIER);
    if (petXpAmount > 0)
      addPetXP(petInfo.id, petStarsFromEnhance(petInfo.enhance), petXpAmount);
  }

  /**
   * Concede XP/pet XP na hora e rola o loot da batalha em lootbags (sem
   * mutar inventário/coleção ainda). A concessão acontece quando o jogador
   * coleta cada lootbag (ou no fim da janela via `grantLootBag`).
   */
  function prepareBattleLoot(): LootBagContents[] {
    giveXp(xpReward);
    givePetXp();

    const noopAddItem = () => false;
    const noopAddDrop = () => {};

    const equipmentDrops = collectEquipmentDrops(noopAddDrop);
    const itemDrops = collectMaterialDrops(noopAddItem);
    const { chestDrop, keyDrop } = collectChestAndKeyDrops(noopAddItem);

    const petDrop = collectPetDrop(noopAddDrop);
    if (petDrop) equipmentDrops.push(petDrop);

    const cardDrop = collectCardDrop(noopAddItem);
    if (cardDrop) itemDrops.push(cardDrop);

    return buildLootBags({
      npcClass,
      coinReward,
      itemDrops,
      equipmentDrops,
      chestDrop,
      keyDrop,
    });
  }

  /** Concede o conteúdo de uma lootbag ao inventário/coleção/progresso. */
  function grantLootBag(contents: LootBagContents) {
    if (contents.coins > 0) addCoins(player.character, contents.coins);
    if (contents.hyperCoins > 0)
      addHyperCoins(player.character, contents.hyperCoins);

    for (const drop of contents.equipmentDrops) {
      addDrop(player.character, drop.id, drop.enhance);
    }

    for (const item of contents.itemDrops) {
      addItem({ id: item.id, qty: item.qty });
    }

    if (contents.chestDrop) addItem({ id: contents.chestDrop.id });
    if (contents.keyDrop) addItem({ id: contents.keyDrop.id });

    if (contents.itemDrops.length > 0) {
      progressDailyWeekly("collect_material", contents.itemDrops.length);
      for (const drop of contents.itemDrops) {
        if (drop.id === "hungry_essence")
          progressDailyWeekly("collect_hungry_essence", drop.qty);
        else if (drop.id === "goat_horn")
          progressDailyWeekly("collect_goat_horn", drop.qty);
      }
    }
  }

  function giveSummonRewards(npcClass: NPCClass) {
    const xp = calculateXP(npcLevel, npcClass) ?? 0;
    const coins = getCoinReward(npcClass, npcLevel);

    addXP(player.character, xp);
    addCoins(player.character, coins);

    const petInfo = getEquippedInfo(player.character, "pet");
    if (petInfo) {
      const petXpAmount = Math.floor(xp * PET_XP_MULTIPLIER);
      if (petXpAmount > 0)
        addPetXP(petInfo.id, petStarsFromEnhance(petInfo.enhance), petXpAmount);
    }
  }

  return {
    xpReward,
    coinReward,
    prepareBattleLoot,
    grantLootBag,
    giveSummonRewards,
  };
}
