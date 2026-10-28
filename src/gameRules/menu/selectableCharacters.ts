import { CHARACTERS } from "@/data/options/characters";

type UnlockFlags = {
  samurionUnlocked: boolean;
  yvelUnlocked: boolean;
  srGuaxinimUnlocked: boolean;
};

export function getSelectableCharacters(flags: UnlockFlags) {
  return CHARACTERS.filter(
    (c) =>
      c.selectable ||
      (c.image === "samurion" && flags.samurionUnlocked) ||
      (c.image === "yvel" && flags.yvelUnlocked) ||
      (c.image === "srGuaxinim" && flags.srGuaxinimUnlocked),
  );
}
