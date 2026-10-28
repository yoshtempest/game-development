export const CHARACTERS = [
  "marshadow",
  "drika",
  "yvel",
  "samurion",
  "srGuaxinim",
  "yra",
  "babidi",
  "natsuki",
  "laricell",
  "camyKaze",
  "ematron",
  "levi",
] as const;

export type CharacterId = (typeof CHARACTERS)[number];

export const DEFAULT_CHARACTER: CharacterId = "marshadow";

export function isCharacter(value: unknown): value is CharacterId {
  return (
    typeof value === "string" &&
    (CHARACTERS as readonly string[]).includes(value)
  );
}
