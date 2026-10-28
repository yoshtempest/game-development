import { CHARACTERS } from "@/data/options/characters";

const CHAR_UNLOCK_FLAGS: Record<string, FlagId> = {
  samurion: "samurionUnlocked",
  srGuaxinim: "srGuaxinimUnlocked",
  ematron: "ematronUnlocked",
  laricell: "laricellUnlocked",
  yra: "yraUnlocked",
  camyKaze: "kamykazeUnlocked",
  yvel: "yvelUnlocked",
  babidi: "babidiUnlocked",
  natsuki: "natsukiUnlocked",
};

export function getUnlockedCharacters(hasFlag: (flag: FlagId) => boolean) {
  return CHARACTERS.filter(
    (c) =>
      c.selectable ||
      (c.image in CHAR_UNLOCK_FLAGS && hasFlag(CHAR_UNLOCK_FLAGS[c.image]!)),
  );
}

export function distributeSharedXp(
  totalXp: number,
  winner: CharacterId,
  unlocked: { image: CharacterId }[],
): Partial<Record<CharacterId, number>> {
  const n = unlocked.length;
  const result: Partial<Record<CharacterId, number>> = { [winner]: totalXp };
  if (n <= 1) return result;

  const winnerShare = Math.round(totalXp * (1 / n + 0.1));
  const restPool = Math.max(totalXp - winnerShare, 0);
  const others = unlocked.filter((c) => c.image !== winner);
  const baseRest = Math.floor(restPool / others.length);
  let remainder = restPool - baseRest * others.length;

  result[winner] = winnerShare;
  for (const other of others) {
    const extra = remainder > 0 ? 1 : 0;
    result[other.image] = baseRest + extra;
    remainder -= extra;
  }

  return result;
}
