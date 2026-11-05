import type { CharacterId } from "@/data/characters/list";

export type CharacterPassiveId =
  | "rewindTime"
  | "vastolordForm"
  | "cursedEnergy"
  | "honoredOne"
  | "babidiCloneBurst"
  | "clearCut"
  | "combo"
  | "notImplemented";

export type CharacterPassiveKind =
  | { kind: "rewindTime"; rewindMs: number }
  | { kind: "vastolordForm"; durationMs: number }
  | { kind: "cursedEnergy" }
  | { kind: "honoredOne" }
  | { kind: "babidiCloneBurst" }
  | { kind: "clearCut " }
  | { kind: "combo"; windowMs: number }
  | { kind: "notImplemented" };

export type CharacterPassive = {
  id: CharacterPassiveId;
  name: string;
  description: string;
  characterId: CharacterId;
  unlockedAtLevel: number;
  oncePerBattle: boolean;
  effect: CharacterPassiveKind;
};

export type CharacterPassiveOfKind<K extends CharacterPassiveKind["kind"]> =
  CharacterPassive & { effect: Extract<CharacterPassiveKind, { kind: K }> };
