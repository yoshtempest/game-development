import { isCharRewardId, type RewardDef } from "@/data/rewards";
import { REWARDS_KEY } from "@/data/storageKeys";
import { slotKey } from "@/services/save/slotManager";
import {
  getBlockCount,
  getDamageDealtStats,
  getDamageTakenStats,
  getMissesStats,
  getHitsUsedStats,
  getAttacksUsedStats,
} from "@/utils/rewards";

export type RewardsProgress = Record<string, number>;

/**
 * Lê o progresso de recompensas do slot ativo.
 *
 * `rewards` sempre constou de `GAME_STATE_KEYS`, mas era gravado sem
 * `slotKey()` — a chave global sobrevivia ao `clearSlot` e era
 * compartilhada pelos dois slots. A leitura adota a chave antiga uma
 * única vez, migrando o progresso para o slot ativo em vez de zerá-lo.
 */
export function loadProgress(): RewardsProgress {
  try {
    const raw = localStorage.getItem(slotKey(REWARDS_KEY));
    if (raw) return JSON.parse(raw) as RewardsProgress;

    const legacy = localStorage.getItem(REWARDS_KEY);
    if (!legacy) return {};

    const migrated = JSON.parse(legacy) as RewardsProgress;
    saveProgress(migrated);
    localStorage.removeItem(REWARDS_KEY);
    return migrated;
  } catch {
    return {};
  }
}

export function saveProgress(data: RewardsProgress): void {
  try {
    localStorage.setItem(slotKey(REWARDS_KEY), JSON.stringify(data));
  } catch {}
}

const CHAR_TO_FLAG: Record<string, FlagId> = {
  samuel: "samurionUnlocked",
  artur: "srGuaxinimUnlocked",
  emanuel: "ematronUnlocked",
  larissa: "laricellUnlocked",
  mayra: "yraUnlocked",
  camilly: "kamykazeUnlocked",
  lucas: "yvelUnlocked",
  lucaua: "babidiUnlocked",
  riquelme: "natsukiUnlocked",
};

export function getUnlockedCount(flags: FlagId[]): number {
  let count = 0;
  for (const flag of Object.values(CHAR_TO_FLAG)) {
    if (flags.includes(flag)) count++;
  }
  return count + 2;
}

export function getMaxNpcKills(
  bestiary: Record<string, { kills: number }>,
): number {
  let max = 0;
  for (const entry of Object.values(bestiary)) {
    if (entry.kills > max) max = entry.kills;
  }
  return max;
}

type CharProgress = { level: number };

type ProgressContext = {
  totalKills: number;
  totalPlayTime: number;
  unlockedCount: number;
  maxNpcKills: number;
  classKills: Record<string, number>;
};

const CURRENT_BY_ID: Record<string, (ctx: ProgressContext) => number> = {
  kill_enemies: (ctx) => ctx.totalKills,
  play_time: (ctx) => Math.floor(ctx.totalPlayTime / 3600),
  unlock_chars: (ctx) => ctx.unlockedCount,
  kill_same_npc: (ctx) => ctx.maxNpcKills,
  kill_legendary: (ctx) => ctx.classKills.legendary ?? 0,
  kill_boss: (ctx) => ctx.classKills.boss ?? 0,
  kill_rare: (ctx) => ctx.classKills.rare ?? 0,
  damage_dealt: () => getDamageDealtStats().total,
  damage_taken: () => getDamageTakenStats().total,
  blocks: () => getBlockCount().total,
  misses: () => getMissesStats().total,
  hits_used: () => getHitsUsedStats().total,
  attacks_used: () => getAttacksUsedStats().total,
};

const CURRENT_BY_CHAR_TYPE: Record<
  string,
  (charId: string, charsProgress: Record<string, CharProgress>) => number
> = {
  level: (charId, charsProgress) => charsProgress[charId]?.level ?? 0,
  damage: (charId) => getDamageDealtStats().perCharacter[charId] ?? 0,
  hits: (charId) => getHitsUsedStats().perCharacter[charId] ?? 0,
  attacks: (charId) => getAttacksUsedStats().perCharacter[charId] ?? 0,
};

function progress(
  current: number,
  def: RewardDef,
  stage: number,
): { current: number; requirement: number } {
  return { current, requirement: def.getRequirement(stage) };
}

export function getProgress(
  def: RewardDef,
  stage: number,
  totalKills: number,
  totalPlayTime: number,
  unlockedCount: number,
  maxNpcKills: number,
  classKills: Record<string, number>,
  charsProgress: Record<string, { level: number }>,
): { current: number; requirement: number } {
  const fixedGetter = CURRENT_BY_ID[def.id];
  if (fixedGetter) {
    return progress(
      fixedGetter({
        totalKills,
        totalPlayTime,
        unlockedCount,
        maxNpcKills,
        classKills,
      }),
      def,
      stage,
    );
  }

  const parsed = isCharRewardId(def.id);
  if (!parsed) return { current: 0, requirement: 0 };

  const charGetter = CURRENT_BY_CHAR_TYPE[parsed.type];
  if (!charGetter) return { current: 0, requirement: 0 };

  return progress(charGetter(parsed.charId, charsProgress), def, stage);
}
