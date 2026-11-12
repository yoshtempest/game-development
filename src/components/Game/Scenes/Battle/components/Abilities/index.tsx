import { useBattleMana } from "@/contexts/BattleManaContext";
import type { AbilitySlot, Props } from "./types";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import {
  CURSED_ENERGY_HEAL_RATIO,
  BLINK_ENERGY_COST,
  DIVERGENT_FIST_COST,
} from "@/gameRules/battle/cursedEnergy";
import { YVEL_WEAPON_SWITCH_MANA_COST } from "@/gameRules/battle/mana";
import { DOMAIN_EXPANSIONS } from "@/data/characters/domainExpansions";
import { npcPath, playerAbilityBackgroundPath } from "@/utils/paths";
import { PetSkillButton } from "@/components/Game/Battle/Buttons/PetSkill";
import { WeaponSwitchButton } from "@/components/Game/Battle/Buttons/WeaponSwitch";
import { CursedEnergyButton } from "@/components/Game/Battle/Buttons/Natsuki/CursedEnergy";
import { BlinkButton } from "@/components/Game/Battle/Buttons/Natsuki/Blink";
import { DivergentFistButton } from "@/components/Game/Battle/Buttons/Natsuki/DivergentFist";
import { SphereJunction } from "@/components/Game/Battle/Buttons/Natsuki/SphereJunction";
import { EmatronCloneButton } from "@/components/Game/Battle/Buttons/Ematron/Clone";
import { EmatronKiChargeButton } from "@/components/Game/Battle/Buttons/Ematron/KiCharge";
import { EmatronGenkiDamaButton } from "@/components/Game/Battle/Buttons/Ematron/GenkiDama";
import { EmatronKamehamehaButton } from "@/components/Game/Battle/Buttons/Ematron/Kamehameha";
import { VastolordLaserButton } from "@/components/Game/Battle/Buttons/Marshadow/VastolordLaser";
import { AtomicButton } from "@/components/Game/Battle/Buttons/Marshadow/Atomic";
import { KillerQueenButton } from "@/components/Game/Battle/Buttons/SrGuaxinim/KillerQueen";
import { StackExplosionButton } from "@/components/Game/Battle/Buttons/Laricell/StackExplosion";
import { DomainExpansionButton } from "@/components/Game/Battle/Buttons/DomainExpansion";
import { GenericAbilityButton } from "@/components/Game/Battle/Buttons/GenericAbilityButton";
import { GranReyCeroButton } from "@/components/Game/Battle/Buttons/Marshadow/GranReyCero";
import { useRef } from "react";
import { useAbilityShortcuts } from "@/hooks/battle/useAbilityShortcuts";

export function BattleAbilities({
  scene,
  controlsDisabled,
  isBattleNavOpen,
}: Props) {
  const abilitySlotsRef = useRef<AbilitySlot[]>([]);
  abilitySlotsRef.current = [];

  const {
    player,
    battle,
    triggerAbilityCameraFocus,
    petSkill,
    pet,
    switchWeapon,
    yvelWeapon,
    yvelBladeWorks,
    openSigilo,
    sphere,
    bluePress,
    blueUsable,
    redPress,
    redUsable,
    purplePress,
    purpleUsable,
    activateDivergentFist,
    divergentFistActive,
    blink,
    convertCursedEnergy,
    honoredOneActive,
    atomicPress,
    atomicUsable,
    atomicRemaining,
    granReyCeroPress,
    granReyCeroUsable,
    granReyCeroRemaining,
    vastolordActive,
    vastolordLaserPress,
    vastolordLaserUsable,
    vastolordLaserStacks,
    activeAbilityPress,
    activeAbilityUsable,
    activeAbilityRemaining,
    babidiBombDropPress,
    babidiBombDropUsable,
    babidiBombDropRemaining,
    fishingNetPress,
    fishingNetUsable,
    fishingNetRemaining,
    babidiMachineGamaControl,
    babidiMachineGamaSelfDestruct,
    domainExpansionPress,
    domainExpansionUsable,
    clonePress,
    cloneRelease,
    cloneUsable,
    kiChargePress,
    kiChargeRelease,
    kiChargeUsable,
    genkiDamaPress,
    genkiDamaRelease,
    genkiDamaUsable,
    kamehamehaPress,
    kamehamehaUsable,
  } = scene;

  const battleMana = useBattleMana();

  const domainConfig = DOMAIN_EXPANSIONS[player.character];
  const domainBackground = domainConfig.hasBackgroundArt
    ? playerAbilityBackgroundPath(player.character, "domainExpansion")
    : undefined;

  useAbilityShortcuts({
    abilitySlotsRef,
    controlsDisabled,
    isBattleNavOpen,
    playerMode: player.mode,
    playerCharacter: player.character,
    triggerAbilityCameraFocus,
  });

  return (
    <div
      className="abilityButtons"
      onClick={(e) => {
        const btn = (e.target as HTMLElement | null)?.closest(".abilityButton");
        if (!btn) return;
        const buttons = Array.from(
          e.currentTarget.querySelectorAll(".abilityButton"),
        );
        const idx = buttons.indexOf(btn);
        if (idx < 0) return;
        const slot = abilitySlotsRef.current[idx];
        if (!slot || slot.hold || slot.disabled || !slot.abilityId) return;
        triggerAbilityCameraFocus(player.character, slot.abilityId);
      }}
      onPointerDown={(e) => {
        const btn = (e.target as HTMLElement | null)?.closest(".abilityButton");
        if (!btn) return;
        const buttons = Array.from(
          e.currentTarget.querySelectorAll(".abilityButton"),
        );
        const idx = buttons.indexOf(btn);
        if (idx < 0) return;
        const slot = abilitySlotsRef.current[idx];
        if (!slot || !slot.hold || slot.disabled || !slot.abilityId) return;
        triggerAbilityCameraFocus(player.character, slot.abilityId);
      }}
    >
      {petSkill &&
        pet &&
        (() => {
          abilitySlotsRef.current.push({
            click: petSkill.trigger,
            disabled: controlsDisabled,
            hold: false,
          });
          return (
            <PetSkillButton
              imageUrl={npcPath(`/${petSkill.definition.npcType}/face.svg`)}
              skillName={petSkill.definition.skill.name}
              ready={petSkill.ready}
              remaining={petSkill.remaining}
              cooldownMs={petSkill.definition.skill.cooldownMs}
              disabled={controlsDisabled}
              onClick={petSkill.trigger}
            />
          );
        })()}

      {player.character === "yvel" &&
        (() => {
          const weaponSwitchDisabled =
            controlsDisabled ||
            (!yvelBladeWorks.active &&
              battleMana != null &&
              battleMana.playerMana < YVEL_WEAPON_SWITCH_MANA_COST);
          abilitySlotsRef.current.push({
            click: switchWeapon,
            disabled: weaponSwitchDisabled,
            hold: false,
            abilityId: "weaponSwitch",
          });
          return (
            <WeaponSwitchButton
              weapon={yvelWeapon}
              disabled={weaponSwitchDisabled}
              onClick={switchWeapon}
            />
          );
        })()}

      {player.character === "drika" &&
        (() => {
          abilitySlotsRef.current.push({
            click: () => openSigilo?.(),
            disabled: controlsDisabled,
            hold: false,
            abilityId: "sigilo",
          });
          return (
            <button
              type="button"
              className="abilityButton"
              disabled={controlsDisabled}
              onClick={() => openSigilo?.()}
            >
              Sigilo
            </button>
          );
        })()}

      {player.character === "natsuki" &&
        (() => {
          if (sphere?.variant === "purple") {
            abilitySlotsRef.current.push({
              click: purplePress,
              disabled: controlsDisabled || !purpleUsable,
              hold: false,
              abilityId: "purpleSphere",
            });
          } else {
            abilitySlotsRef.current.push({
              click: bluePress,
              disabled: controlsDisabled || !blueUsable,
              hold: false,
              abilityId: "blueSphere",
            });
            abilitySlotsRef.current.push({
              click: redPress,
              disabled: controlsDisabled || !redUsable,
              hold: false,
              abilityId: "redSphere",
            });
          }
          abilitySlotsRef.current.push({
            click: activateDivergentFist,
            disabled:
              controlsDisabled ||
              (battleMana?.playerMana ?? 0) < DIVERGENT_FIST_COST,
            hold: false,
            abilityId: "divergentFist",
          });
          const blinkOrCursedDisabled = honoredOneActive
            ? controlsDisabled ||
              ALL_PREDICATES.isNatsukiDomain(player.state) ||
              (battleMana?.playerMana ?? 0) < BLINK_ENERGY_COST
            : controlsDisabled ||
              (battleMana?.playerMana ?? 0) < CURSED_ENERGY_HEAL_RATIO ||
              battle.playerHP >= battle.playerMaxHp;
          abilitySlotsRef.current.push({
            click: honoredOneActive ? blink : convertCursedEnergy,
            disabled: blinkOrCursedDisabled,
            hold: false,
            abilityId: honoredOneActive ? "blink" : "cursedEnergyConversion",
          });
          return (
            <>
              <SphereJunction
                blueActive={
                  sphere?.variant === "blue" && sphere.phase !== "dismissing"
                }
                blueDisabled={controlsDisabled || !blueUsable}
                redDisabled={controlsDisabled || !redUsable}
                purpleActive={sphere?.variant === "purple"}
                purpleDisabled={controlsDisabled || !purpleUsable}
                onBlue={bluePress}
                onRed={redPress}
                onPurple={purplePress}
              />
              <DivergentFistButton
                energy={battleMana?.playerMana ?? 0}
                active={divergentFistActive}
                disabled={
                  controlsDisabled ||
                  (battleMana?.playerMana ?? 0) < DIVERGENT_FIST_COST
                }
                onClick={activateDivergentFist}
              />
              {honoredOneActive ? (
                <BlinkButton
                  energy={battleMana?.playerMana ?? 0}
                  disabled={
                    controlsDisabled ||
                    ALL_PREDICATES.isNatsukiDomain(player.state) ||
                    (battleMana?.playerMana ?? 0) < BLINK_ENERGY_COST
                  }
                  onClick={blink}
                />
              ) : (
                <CursedEnergyButton
                  energy={battleMana?.playerMana ?? 0}
                  energyMax={battleMana?.playerMaxMana ?? 100}
                  disabled={
                    controlsDisabled ||
                    (battleMana?.playerMana ?? 0) < CURSED_ENERGY_HEAL_RATIO ||
                    battle.playerHP >= battle.playerMaxHp
                  }
                  onClick={convertCursedEnergy}
                />
              )}
            </>
          );
        })()}

      {player.character === "ematron" &&
        (() => {
          abilitySlotsRef.current.push({
            press: clonePress,
            release: cloneRelease,
            disabled: controlsDisabled || !cloneUsable,
            hold: true,
            abilityId: "clone",
          });
          abilitySlotsRef.current.push({
            press: kiChargePress,
            release: kiChargeRelease,
            disabled: controlsDisabled || !kiChargeUsable,
            hold: true,
            abilityId: "kiCharge",
          });
          abilitySlotsRef.current.push({
            press: genkiDamaPress,
            release: genkiDamaRelease,
            disabled: controlsDisabled || !genkiDamaUsable,
            hold: true,
            abilityId: "genkiDama",
          });
          abilitySlotsRef.current.push({
            click: kamehamehaPress,
            disabled: controlsDisabled || !kamehamehaUsable,
            hold: false,
            abilityId: "kamehameha",
          });
          return (
            <>
              <EmatronCloneButton
                energy={battleMana?.playerMana ?? 0}
                disabled={controlsDisabled || !cloneUsable}
                onPress={clonePress}
                onRelease={cloneRelease}
              />
              <EmatronKiChargeButton
                energy={battleMana?.playerMana ?? 0}
                energyMax={battleMana?.playerMaxMana ?? 100}
                disabled={controlsDisabled || !kiChargeUsable}
                onPress={kiChargePress}
                onRelease={kiChargeRelease}
              />
              <EmatronGenkiDamaButton
                energy={battleMana?.playerMana ?? 0}
                disabled={controlsDisabled || !genkiDamaUsable}
                onPress={genkiDamaPress}
                onRelease={genkiDamaRelease}
              />
              <EmatronKamehamehaButton
                disabled={controlsDisabled || !kamehamehaUsable}
                onClick={kamehamehaPress}
              />
            </>
          );
        })()}

      {player.character === "marshadow" &&
        (() => {
          if (!vastolordActive) {
            abilitySlotsRef.current.push({
              click: atomicPress,
              disabled: controlsDisabled,
              hold: false,
              abilityId: "iAmAtomic",
            });
            abilitySlotsRef.current.push({
              click: granReyCeroPress,
              disabled: controlsDisabled,
              hold: false,
              abilityId: "granReyCero",
            });
          } else {
            abilitySlotsRef.current.push({
              click: vastolordLaserPress,
              disabled: !vastolordLaserUsable,
              hold: false,
              abilityId: "vastolordLaser",
            });
          }
          return !vastolordActive ? (
            <>
              <AtomicButton
                ready={atomicUsable}
                remaining={atomicRemaining}
                disabled={controlsDisabled}
                onClick={atomicPress}
              />
              <GranReyCeroButton
                ready={granReyCeroUsable}
                remaining={granReyCeroRemaining}
                disabled={controlsDisabled}
                onClick={granReyCeroPress}
              />
            </>
          ) : (
            <VastolordLaserButton
              charges={vastolordLaserStacks}
              disabled={!vastolordLaserUsable}
              onClick={vastolordLaserPress}
            />
          );
        })()}

      {player.character === "srGuaxinim" &&
        (() => {
          abilitySlotsRef.current.push({
            click: activeAbilityPress,
            disabled: controlsDisabled,
            hold: false,
            abilityId: "killerQueen",
          });
          return (
            <KillerQueenButton
              ready={activeAbilityUsable}
              remaining={activeAbilityRemaining}
              disabled={controlsDisabled}
              onClick={activeAbilityPress}
            />
          );
        })()}

      {player.character === "laricell" &&
        (() => {
          abilitySlotsRef.current.push({
            click: activeAbilityPress,
            disabled: controlsDisabled,
            hold: false,
            abilityId: "stackExplosion",
          });
          return (
            <StackExplosionButton
              ready={activeAbilityUsable}
              remaining={activeAbilityRemaining}
              disabled={controlsDisabled}
              onClick={activeAbilityPress}
            />
          );
        })()}

      {player.character === "babidi" &&
        (() => {
          abilitySlotsRef.current.push({
            click: babidiBombDropPress,
            disabled: controlsDisabled || !babidiBombDropUsable,
            hold: false,
            abilityId: "dimensionalPortal",
          });
          abilitySlotsRef.current.push({
            click: fishingNetPress,
            disabled: controlsDisabled || !fishingNetUsable,
            hold: false,
            abilityId: "fishingNet",
          });
          return (
            <>
              <GenericAbilityButton
                characterId="babidi"
                abilityId="dimensionalPortal"
                ready={babidiBombDropUsable}
                remaining={babidiBombDropRemaining}
                disabled={controlsDisabled || !babidiBombDropUsable}
                onClick={babidiBombDropPress}
              />
              <GenericAbilityButton
                characterId="babidi"
                abilityId="fishingNet"
                ready={fishingNetUsable}
                remaining={fishingNetRemaining}
                disabled={controlsDisabled || !fishingNetUsable}
                onClick={fishingNetPress}
              />
              {babidiMachineGamaControl && (
                <GenericAbilityButton
                  characterId="babidi"
                  abilityId="machineGamaSelfDestruct"
                  ready={true}
                  disabled={false}
                  onClick={babidiMachineGamaSelfDestruct}
                />
              )}
            </>
          );
        })()}

      {!vastolordActive &&
        (() => {
          abilitySlotsRef.current.push({
            click: domainExpansionPress,
            disabled: controlsDisabled,
            hold: false,
            abilityId:
              player.character === "marshadow"
                ? "domainExpansion"
                : "domainBurst",
          });
          return (
            <DomainExpansionButton
              name={domainConfig.name}
              description={domainConfig.description}
              accent={domainConfig.accent}
              background={domainBackground}
              ready={domainExpansionUsable}
              disabled={controlsDisabled}
              onClick={domainExpansionPress}
            />
          );
        })()}
    </div>
  );
}
