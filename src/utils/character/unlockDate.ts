import { CHAR_UNLOCK_DATES_KEY } from "@/data/storageKeys";
import { saveCompressed, loadCompressed } from "@/services/save/storageService";
import { slotKey } from "@/services/save/slotManager";

type UnlockDates = Record<string, string>;

export const UNLOCK_FLAG_TO_CHAR = {
  samurionUnlocked: "samurion",
  srGuaxinimUnlocked: "srGuaxinim",
  ematronUnlocked: "ematron",
  laricellUnlocked: "laricell",
  yraUnlocked: "yra",
  kamykazeUnlocked: "camyKaze",
  yvelUnlocked: "yvel",
  babidiUnlocked: "babidi",
  natsukiUnlocked: "natsuki",
} as const satisfies Record<string, CharacterId>;

export type UnlockFlagId = keyof typeof UNLOCK_FLAG_TO_CHAR;

export function isUnlockFlag(flag: FlagId): flag is UnlockFlagId {
  return flag in UNLOCK_FLAG_TO_CHAR;
}

function loadUnlockDates(): UnlockDates {
  try {
    return loadCompressed<UnlockDates>(slotKey(CHAR_UNLOCK_DATES_KEY)) ?? {};
  } catch {
    return {};
  }
}

export function saveUnlockDate(flag: FlagId): void {
  if (!isUnlockFlag(flag)) return;
  const charId = UNLOCK_FLAG_TO_CHAR[flag];

  const dates = loadUnlockDates();
  if (dates[charId]) return;

  dates[charId] = new Date().toISOString();
  saveCompressed(slotKey(CHAR_UNLOCK_DATES_KEY), dates);
}

export function getUnlockDate(charId: string): string | null {
  const dates = loadUnlockDates();
  return dates[charId] ?? null;
}

const UNKNOWN_DATE = "??/??/????";

/**
 * Data em que o personagem foi desbloqueado no save atual.
 *
 * Prioriza a data gravada por `saveUnlockDate` (o momento em que a flag de
 * desbloqueio disparou) e cai para a data do primeiro login quando o
 * personagem não tem registro — é o que acontece com quem já vinha
 * disponível desde a criação do save.
 */
export function getCharacterUnlockDate(
  charId: string,
  firstLoginDate: string,
): string {
  return formatUnlockDate(getUnlockDate(charId) ?? firstLoginDate);
}

/** Formata um ISO date para `dd/mm/aaaa`, ou `??/??/????` se não houver data. */
export function formatUnlockDate(isoDate: string | null | undefined): string {
  if (!isoDate) return UNKNOWN_DATE;
  return new Date(isoDate).toLocaleDateString("pt-BR");
}
