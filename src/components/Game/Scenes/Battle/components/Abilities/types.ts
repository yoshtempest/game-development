import type { useBattleScene } from "@/hooks/battle/main/battleScene/useScene";

export type AbilitySlot = {
  click?: () => void;
  press?: () => void;
  release?: () => void;
  disabled: boolean;
  hold: boolean;
  abilityId?: string;
};

type SceneSlice = Pick<
  ReturnType<typeof useBattleScene>,
  | "player"
  | "battle"
  | "triggerAbilityCameraFocus"
  | "petSkill"
  | "pet"
  | "switchWeapon"
  | "yvelWeapon"
  | "openSigilo"
  | "sphere"
  | "bluePress"
  | "blueUsable"
  | "redPress"
  | "redUsable"
  | "purplePress"
  | "purpleUsable"
  | "activateDivergentFist"
  | "divergentFistActive"
  | "blink"
  | "convertCursedEnergy"
  | "honoredOneActive"
  | "atomicPress"
  | "atomicUsable"
  | "atomicRemaining"
  | "granReyCeroPress"
  | "granReyCeroUsable"
  | "granReyCeroRemaining"
  | "vastolordActive"
  | "vastolordLaserPress"
  | "vastolordLaserUsable"
  | "vastolordLaserStacks"
  | "activeAbilityPress"
  | "activeAbilityUsable"
  | "activeAbilityRemaining"
  | "babidiBombDropPress"
  | "babidiBombDropUsable"
  | "babidiBombDropRemaining"
  | "babidiToxicFormPress"
  | "babidiToxicFormUsable"
  | "babidiToxicFormRemaining"
  | "fishingNetPress"
  | "fishingNetUsable"
  | "fishingNetRemaining"
  | "babidiMachineGamaControl"
  | "babidiMachineGamaSelfDestruct"
  | "domainExpansionPress"
  | "domainExpansionUsable"
  | "clonePress"
  | "cloneRelease"
  | "cloneUsable"
  | "kiChargePress"
  | "kiChargeRelease"
  | "kiChargeUsable"
  | "genkiDamaPress"
  | "genkiDamaRelease"
  | "genkiDamaUsable"
  | "kamehamehaPress"
  | "kamehamehaUsable"
>;

export type Props = {
  scene: SceneSlice;
  controlsDisabled: boolean;
  isBattleNavOpen: boolean;
};
