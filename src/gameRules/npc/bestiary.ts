import { NPCS, isNpcType } from "@/data/npc";
import { TITLES, TITLE_IDS } from "@/data/titles";
import { CRAFT_DROP_TABLES } from "@/data/items/crafting";
import { DROP_CONFIG } from "@/data/equipment/drops";
import {
  COIN_REWARDS,
  CHEST_DROP_CHANCE,
  KEY_DROP_CHANCE,
} from "@/data/battle/drops";
import { ITEMS } from "@/data/items";

export function getNpcClass(npcType: string): NPCClass | null {
  const base = npcType.endsWith("_alfa") ? npcType.slice(0, -5) : npcType;
  return isNpcType(base) ? NPCS[base].class : null;
}

export function getLinkedTitles(npcType: string, npcClass: NPCClass): string[] {
  const linked: string[] = [];
  for (const titleId of TITLE_IDS) {
    const def = TITLES[titleId];
    if (!def) continue;
    if (
      def.condition.type === "killNpcType" &&
      npcType.startsWith(def.condition.npcTypePrefix)
    ) {
      linked.push(def.name);
    } else if (
      def.condition.type === "killNpcClass" &&
      npcClass === def.condition.npcClass
    ) {
      linked.push(def.name);
    } else if (def.condition.type === "killTotal") {
      linked.push(def.name);
    }
  }
  return linked;
}

export function getDropItems(npcClass: NPCClass, npcType: string) {
  const baseNpcType = npcType.endsWith("_alfa") ? npcType.slice(0, -5) : npcType;
  const drops: { name: string; chance: string }[] = [];

  const coinAmount = COIN_REWARDS[npcClass];
  if (coinAmount) {
    drops.push({ name: `${coinAmount} moedas por nível`, chance: "Sempre" });
  }

  const craftTable = CRAFT_DROP_TABLES[npcClass];
  if (craftTable) {
    for (const entry of craftTable.always) {
      const item = ITEMS[entry.id as keyof typeof ITEMS];
      if (item) {
        drops.push({
          name: item.name,
          chance: `${(entry.chance * 100).toFixed(0)}%`,
        });
      }
    }
    if (craftTable.perNpcType) {
      const typeDrops = craftTable.perNpcType[baseNpcType];
      if (typeDrops) {
        for (const entry of typeDrops) {
          const item = ITEMS[entry.id as keyof typeof ITEMS];
          if (item) {
            drops.push({
              name: item.name,
              chance: `${(entry.chance * 100).toFixed(0)}%`,
            });
          }
        }
      }
    }
  }

  const dropConfig = DROP_CONFIG[npcClass];
  if (dropConfig) {
    drops.push({
      name: "Equipamentos",
      chance: `${(dropConfig.baseChance * 100).toFixed(0)}%`,
    });
  }

  const chestChance = CHEST_DROP_CHANCE[npcClass];
  if (chestChance) {
    const chestItem = ITEMS[`${npcClass}_chest` as keyof typeof ITEMS];
    if (chestItem) {
      drops.push({
        name: chestItem.name,
        chance: `${(chestChance * 100).toFixed(0)}%`,
      });
    }
  }

  const keyChance = KEY_DROP_CHANCE[npcClass];
  if (keyChance) {
    const keyItem = ITEMS[`${npcClass}_key` as keyof typeof ITEMS];
    if (keyItem) {
      drops.push({
        name: keyItem.name,
        chance: `${(keyChance * 100).toFixed(0)}%`,
      });
    }
  }

  if (npcType.startsWith("goat")) {
    drops.push({ name: "Bodão (pet)", chance: "1%" });
  }

  return drops;
}
