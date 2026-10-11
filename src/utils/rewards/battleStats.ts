import { BATTLE_STATS_KEY } from "@/data/storageKeys";
import { createSlotJsonStorage } from "@/utils/rewards/createSlotJsonStorage";
import { slotKey } from "@/services/save/slotManager";
import { FIVE_HUNDRED_MS } from "@/data/ms";

type PerCharacterStats = {
  total: number;
  perCharacter: Record<string, number>;
};

type BattleStatsData = {
  damageDealt: PerCharacterStats;
  damageTaken: PerCharacterStats;
  misses: PerCharacterStats;
  equipmentDrops: { total: number };
  hitsUsed: PerCharacterStats;
  attacksUsed: PerCharacterStats;
};

function createDefaultPerChar(): PerCharacterStats {
  return { total: 0, perCharacter: {} };
}

function createDefault(): BattleStatsData {
  return {
    damageDealt: createDefaultPerChar(),
    damageTaken: createDefaultPerChar(),
    misses: createDefaultPerChar(),
    equipmentDrops: { total: 0 },
    hitsUsed: createDefaultPerChar(),
    attacksUsed: createDefaultPerChar(),
  };
}

const statsStorage = createSlotJsonStorage(BATTLE_STATS_KEY, createDefault);

/**
 * Escrita adiada e leitura em cache.
 *
 * Um golpe dispara três incrementos na mesma tarefa (dano, golpe usado,
 * hit usado); cada um fazia `getItem` + `JSON.parse` + `JSON.stringify` +
 * `setItem` síncronos. O estado fica em memória e só vaza para o
 * `localStorage` depois de {@link FLUSH_DELAY_MS} — o suficiente para
 * coalescer um combo inteiro sem perder mais que meio segundo num crash.
 *
 * A chave é resolvida junto com a leitura (igual `useCompressedStorage`):
 * a troca de slot muda `slotKey` antes do reload, e gravar no instante do
 * flush despejaria os stats do slot de origem por cima do destino — por
 * isso o flush também confere se a chave continua sendo a mesma.
 */
const FLUSH_DELAY_MS = FIVE_HUNDRED_MS;

let cachedKey: string | null = null;
let cached: BattleStatsData | null = null;
let dirty = false;
let timer: ReturnType<typeof setTimeout> | null = null;

function stats(): BattleStatsData {
  const key = slotKey(BATTLE_STATS_KEY);
  if (cached === null || cachedKey !== key) {
    cached = statsStorage.load();
    cachedKey = key;
    dirty = false;
  }
  return cached;
}

function flush(): void {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
  if (!dirty || cached === null || cachedKey === null) return;
  if (slotKey(BATTLE_STATS_KEY) !== cachedKey) return;
  dirty = false;
  statsStorage.save(cached);
}

function mutate(update: (data: BattleStatsData) => void): void {
  update(stats());
  dirty = true;
  if (timer !== null) return;
  timer = setTimeout(() => {
    timer = null;
    flush();
  }, FLUSH_DELAY_MS);
}

window.addEventListener("pagehide", flush);

// Damage dealt
export function incrementDamageDealtStats(
  character: string,
  amount: number,
): void {
  mutate((data) => {
    data.damageDealt.total += amount;
    data.damageDealt.perCharacter[character] =
      (data.damageDealt.perCharacter[character] ?? 0) + amount;
  });
}

export function getDamageDealtStats(): PerCharacterStats {
  return stats().damageDealt;
}

// Damage taken
export function incrementDamageTakenStats(
  character: string,
  amount: number,
): void {
  mutate((data) => {
    data.damageTaken.total += amount;
    data.damageTaken.perCharacter[character] =
      (data.damageTaken.perCharacter[character] ?? 0) + amount;
  });
}

export function getDamageTakenStats(): PerCharacterStats {
  return stats().damageTaken;
}

// Misses (dodges)
export function incrementMissesStats(character: string): void {
  mutate((data) => {
    data.misses.total += 1;
    data.misses.perCharacter[character] =
      (data.misses.perCharacter[character] ?? 0) + 1;
  });
}

export function getMissesStats(): PerCharacterStats {
  return stats().misses;
}

// Equipment drops
export function incrementEquipmentDropsStats(count: number): void {
  mutate((data) => {
    data.equipmentDrops.total += count;
  });
}

// Hits used (golpes - total of attacks)
export function incrementHitsUsedStats(character: string): void {
  mutate((data) => {
    data.hitsUsed.total += 1;
    data.hitsUsed.perCharacter[character] =
      (data.hitsUsed.perCharacter[character] ?? 0) + 1;
  });
}

export function getHitsUsedStats(): PerCharacterStats {
  return stats().hitsUsed;
}

// Common attacks used
export function incrementAttacksUsedStats(character: string): void {
  mutate((data) => {
    data.attacksUsed.total += 1;
    data.attacksUsed.perCharacter[character] =
      (data.attacksUsed.perCharacter[character] ?? 0) + 1;
  });
}

export function getAttacksUsedStats(): PerCharacterStats {
  return stats().attacksUsed;
}
