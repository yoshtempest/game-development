/**
 * Regras puras do evento diário do Mahoraga (issue #444): aparece uma vez por
 * dia, em algum momento entre 14h e 19h (hora local do aparelho), e some 10
 * minutos depois se o jogador não o enfrentar.
 */

export const MAHORAGA_WINDOW_START_HOUR = 14;
export const MAHORAGA_WINDOW_END_HOUR = 19;
export const MAHORAGA_DESPAWN_MS = 10 * 60 * 1000;

const MINUTE_MS = 60 * 1000;

export type MahoragaEventStatus =
  /** Antes do spawn de hoje. */
  | "waiting"
  /** Spawnado e ainda dentro dos 10 minutos. */
  | "active"
  /** Os 10 minutos passaram sem o jogador enfrentar. */
  | "expired"
  /** O jogador já enfrentou o Mahoraga hoje. */
  | "fought";

export type MahoragaEventState = {
  status: MahoragaEventStatus;
  spawnAt: Date;
  despawnAt: Date;
};

/** Chave `AAAA-MM-DD` do dia local — é o que se persiste para "1 vez por dia". */
export function toDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Hash FNV-1a de 32 bits: estável entre execuções e sem dependência. */
function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Horário do spawn do dia. É **derivado da data** (hash do dia), não sorteado
 * e salvo: assim o horário é o mesmo após reload, troca de slot ou aba nova,
 * sem precisar persistir nada além do "já enfrentei hoje". O sorteio cabe
 * inteiro na janela — o spawn mais tardio ainda some até as 19h.
 */
export function getMahoragaSpawnTime(date: Date): Date {
  const windowMinutes =
    (MAHORAGA_WINDOW_END_HOUR - MAHORAGA_WINDOW_START_HOUR) * 60 -
    MAHORAGA_DESPAWN_MS / MINUTE_MS;
  const offset = hashString(toDayKey(date)) % (windowMinutes + 1);
  const spawn = new Date(date);
  spawn.setHours(MAHORAGA_WINDOW_START_HOUR, 0, 0, 0);
  return new Date(spawn.getTime() + offset * MINUTE_MS);
}

/**
 * Estado do evento em `now`. `lastFoughtDay` é a `toDayKey` do último
 * encontro; o dia de hoje ali significa que a aparição diária já foi gasta.
 */
export function getMahoragaEventState(
  now: Date,
  lastFoughtDay: string | null,
): MahoragaEventState {
  const spawnAt = getMahoragaSpawnTime(now);
  const despawnAt = new Date(spawnAt.getTime() + MAHORAGA_DESPAWN_MS);
  const base = { spawnAt, despawnAt };

  if (lastFoughtDay === toDayKey(now)) return { ...base, status: "fought" };
  if (now < spawnAt) return { ...base, status: "waiting" };
  if (now < despawnAt) return { ...base, status: "active" };
  return { ...base, status: "expired" };
}
