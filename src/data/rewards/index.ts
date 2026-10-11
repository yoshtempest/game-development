import { CHARACTERS } from "@/data/characters/list";
import type { Character } from "@/utils/types/player/player";
import { CHARACTERS as CHAR_OPTIONS } from "@/data/options/characters";

type CharRewardType = "level" | "damage" | "hits" | "attacks";

type StaticRewardId =
  | "kill_enemies"
  | "play_time"
  | "unlock_chars"
  | "kill_same_npc"
  | "kill_legendary"
  | "kill_boss"
  | "kill_rare"
  | "damage_dealt"
  | "damage_taken"
  | "blocks"
  | "misses"
  | "hits_used"
  | "attacks_used";

export type RewardId = StaticRewardId | `${CharRewardType}_${Character}`;

export type RewardDef = {
  id: RewardId;
  label: string;
  getRequirement: (stage: number) => number;
  getReward: (stage: number) => number;
};

const CHAR_REWARD_TEMPLATES = [
  {
    type: "level",
    label: "Alcance o nível {req} com {char}",
    getRequirement: (stage: number) => 5 * (stage + 1),
    getReward: (stage: number) => 10 * (stage + 1),
  },
  {
    type: "damage",
    label: "Cause {req} de dano com {char}",
    getRequirement: (stage: number) => 1000 * (stage + 1),
    getReward: (stage: number) => 5 * (stage + 1),
  },
  {
    type: "hits",
    label: "Use {req} golpes com {char}",
    getRequirement: (stage: number) => 200 * (stage + 1),
    getReward: (stage: number) => 3 * (stage + 1),
  },
  {
    type: "attacks",
    label: "Use {req} ataques comuns com {char}",
    getRequirement: (stage: number) => 100 * (stage + 1),
    getReward: (stage: number) => 3 * (stage + 1),
  },
] as const satisfies readonly {
  type: CharRewardType;
  label: string;
  getRequirement: (stage: number) => number;
  getReward: (stage: number) => number;
}[];

function charDisplayName(charId: string): string {
  return CHAR_OPTIONS.find((c) => c.image === charId)?.name ?? charId;
}

function generateCharRewards(): RewardDef[] {
  const result: RewardDef[] = [];
  for (const char of CHARACTERS) {
    for (const tpl of CHAR_REWARD_TEMPLATES) {
      result.push({
        id: `${tpl.type}_${char}`,
        label: tpl.label.replace("{char}", charDisplayName(char)),
        getRequirement: tpl.getRequirement,
        getReward: tpl.getReward,
      });
    }
  }
  return result;
}

export function isCharRewardId(
  id: string,
): { charId: Character; type: CharRewardType } | null {
  const types: CharRewardType[] = ["level", "damage", "hits", "attacks"];
  for (const t of types) {
    const prefix = t + "_";
    if (id.startsWith(prefix)) {
      const char = id.slice(prefix.length);
      if ((CHARACTERS as readonly string[]).includes(char)) {
        return { charId: char as Character, type: t };
      }
    }
  }
  return null;
}

export const REWARDS: RewardDef[] = [
  {
    id: "kill_enemies",
    label: "Derrote {req} inimigos",
    getRequirement: (stage) => 100 * (stage + 1),
    getReward: (stage) => 10 * (stage + 1),
  },
  {
    id: "play_time",
    label: "Jogue por {req}h",
    getRequirement: (stage) => 10 * (stage + 1),
    getReward: (stage) => 5 * (stage + 1),
  },
  {
    id: "unlock_chars",
    label: "Desbloqueie {req} personagens",
    getRequirement: (stage) => stage + 3,
    getReward: (stage) => 20 * (stage + 1),
  },
  {
    id: "kill_same_npc",
    label: "Derrote um mesmo NPC {req} vezes",
    getRequirement: (stage) => 10 * (stage + 1),
    getReward: (stage) => 5 * (stage + 1),
  },
  {
    id: "kill_legendary",
    label: "Derrote {req} NPCs lendários",
    getRequirement: (stage) => stage + 1,
    getReward: (stage) => 50 * (stage + 1),
  },
  {
    id: "kill_boss",
    label: "Derrote {req} Boss",
    getRequirement: (stage) => stage + 1,
    getReward: (stage) => 30 * (stage + 1),
  },
  {
    id: "kill_rare",
    label: "Derrote {req} NPCs raros",
    getRequirement: (stage) => 10 * (stage + 1),
    getReward: (stage) => 15 * (stage + 1),
  },
  {
    id: "damage_dealt",
    label: "Cause {req} de dano total",
    getRequirement: (stage) => 5000 * (stage + 1),
    getReward: (stage) => 10 * (stage + 1),
  },
  {
    id: "damage_taken",
    label: "Receba {req} de dano total",
    getRequirement: (stage) => 3000 * (stage + 1),
    getReward: (stage) => 10 * (stage + 1),
  },
  {
    id: "blocks",
    label: "Bloqueie {req} ataques",
    getRequirement: (stage) => 200 * (stage + 1),
    getReward: (stage) => 5 * (stage + 1),
  },
  {
    id: "misses",
    label: "Faça o inimigo errar {req} vezes",
    getRequirement: (stage) => 100 * (stage + 1),
    getReward: (stage) => 5 * (stage + 1),
  },
  {
    id: "hits_used",
    label: "Use {req} golpes",
    getRequirement: (stage) => 1000 * (stage + 1),
    getReward: (stage) => 5 * (stage + 1),
  },
  {
    id: "attacks_used",
    label: "Use {req} ataques comuns",
    getRequirement: (stage) => 500 * (stage + 1),
    getReward: (stage) => 5 * (stage + 1),
  },
  ...generateCharRewards(),
];
