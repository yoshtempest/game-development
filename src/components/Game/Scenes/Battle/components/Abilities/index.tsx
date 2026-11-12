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
import { useCharacterProgress } from "@/contexts/CharacterProgressContext";
import {
  getDomainExpansionAbilityId,
  isAbilityUnlocked,
} from "@/gameRules/player/abilityUnlock";

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
  const { progress } = useCharacterProgress();
  const playerLevel = progress[player.character]?.level ?? 1;

  /**
   * Habilidade bloqueada por nível (issue #485) fica visível e desabilitada em
   * vez de sumir: o índice de `abilitySlotsRef` precisa casar 1:1 com os
   * `.abilityButton` renderizados para clique e atalho numérico continuarem
   * apontando para o botão certo.
   */
  function isLocked(abilityId: string): boolean {
    return !isAbilityUnlocked(player.character, abilityId, playerLevel);
  }
  const domainLocked = isLocked(
    getDomainExpansionAbilityId(player.character) ?? "domainBurst",
  );
  const activeAbilityLocked = isLocked(
    player.character === "laricell" ? "stackExplosion" : "killerQueen",
  );

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
          abilitySlotsRef.current.push({
            click: switchWeapon,
            disabled:
              controlsDisabled ||
              isLocked("weaponSwitch") ||
              (battleMana != null &&
                battleMana.playerMana < YVEL_WEAPON_SWITCH_MANA_COST),
            hold: false,
            abilityId: "weaponSwitch",
          });
          return (
            <WeaponSwitchButton
              weapon={yvelWeapon}
              disabled={
                controlsDisabled ||
                isLocked("weaponSwitch") ||
                (battleMana != null &&
                  battleMana.playerMana < YVEL_WEAPON_SWITCH_MANA_COST)
              }
              onClick={switchWeapon}
            />
          );
        })()}

      {player.character === "drika" &&
        (() => {
          abilitySlotsRef.current.push({
            click: () => openSigilo?.(),
            disabled: controlsDisabled || isLocked("sigilo"),
            hold: false,
            abilityId: "sigilo",
          });
          return (
            <button
              type="button"
              className="abilityButton"
              disabled={controlsDisabled || isLocked("sigilo")}
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
              disabled: controlsDisabled || !purpleUsable || isLocked("purpleSphere"),
              hold: false,
              abilityId: "purpleSphere",
            });
          } else {
            abilitySlotsRef.current.push({
              click: bluePress,
              disabled: controlsDisabled || !blueUsable || isLocked("blueSphere"),
              hold: false,
              abilityId: "blueSphere",
            });
            abilitySlotsRef.current.push({
              click: redPress,
              disabled: controlsDisabled || !redUsable || isLocked("redSphere"),
              hold: false,
              abilityId: "redSphere",
            });
          }
          abilitySlotsRef.current.push({
            click: activateDivergentFist,
            disabled:
              controlsDisabled ||
              isLocked("divergentFist") ||
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
                blueDisabled={controlsDisabled || !blueUsable || isLocked("blueSphere")}
                redDisabled={controlsDisabled || !redUsable || isLocked("redSphere")}
                purpleActive={sphere?.variant === "purple"}
                purpleDisabled={controlsDisabled || !purpleUsable || isLocked("purpleSphere")}
                onBlue={bluePress}
                onRed={redPress}
                onPurple={purplePress}
              />
              <DivergentFistButton
                energy={battleMana?.playerMana ?? 0}
                active={divergentFistActive}
                disabled={
                  controlsDisabled ||
                  isLocked("divergentFist") ||
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
            disabled: controlsDisabled || !cloneUsable || isLocked("clone"),
            hold: true,
            abilityId: "clone",
          });
          abilitySlotsRef.current.push({
            press: kiChargePress,
            release: kiChargeRelease,
            disabled: controlsDisabled || !kiChargeUsable || isLocked("kiCharge"),
            hold: true,
            abilityId: "kiCharge",
          });
          abilitySlotsRef.current.push({
            press: genkiDamaPress,
            release: genkiDamaRelease,
            disabled: controlsDisabled || !genkiDamaUsable || isLocked("genkiDama"),
            hold: true,
            abilityId: "genkiDama",
          });
          abilitySlotsRef.current.push({
            click: kamehamehaPress,
            disabled: controlsDisabled || !kamehamehaUsable || isLocked("kamehameha"),
            hold: false,
            abilityId: "kamehameha",
          });
          return (
            <>
              <EmatronCloneButton
                energy={battleMana?.playerMana ?? 0}
                disabled={controlsDisabled || !cloneUsable || isLocked("clone")}
                onPress={clonePress}
                onRelease={cloneRelease}
              />
              <EmatronKiChargeButton
                energy={battleMana?.playerMana ?? 0}
                energyMax={battleMana?.playerMaxMana ?? 100}
                disabled={controlsDisabled || !kiChargeUsable || isLocked("kiCharge")}
                onPress={kiChargePress}
                onRelease={kiChargeRelease}
              />
              <EmatronGenkiDamaButton
                energy={battleMana?.playerMana ?? 0}
                disabled={controlsDisabled || !genkiDamaUsable || isLocked("genkiDama")}
                onPress={genkiDamaPress}
                onRelease={genkiDamaRelease}
              />
              <EmatronKamehamehaButton
                disabled={controlsDisabled || !kamehamehaUsable || isLocked("kamehameha")}
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
              disabled: controlsDisabled || isLocked("iAmAtomic"),
              hold: false,
              abilityId: "iAmAtomic",
            });
            abilitySlotsRef.current.push({
              click: granReyCeroPress,
              disabled: controlsDisabled || isLocked("granReyCero"),
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
                disabled={controlsDisabled || isLocked("iAmAtomic")}
                onClick={atomicPress}
              />
              <GranReyCeroButton
                ready={granReyCeroUsable}
                remaining={granReyCeroRemaining}
                disabled={controlsDisabled || isLocked("granReyCero")}
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
            disabled: controlsDisabled || isLocked("killerQueen"),
            hold: false,
            abilityId: "killerQueen",
          });
          return (
            <KillerQueenButton
              ready={activeAbilityUsable}
              remaining={activeAbilityRemaining}
              disabled={controlsDisabled || activeAbilityLocked}
              onClick={activeAbilityPress}
            />
          );
        })()}

      {player.character === "laricell" &&
        (() => {
          abilitySlotsRef.current.push({
            click: activeAbilityPress,
            disabled: controlsDisabled || isLocked("stackExplosion"),
            hold: false,
            abilityId: "stackExplosion",
          });
          return (
            <StackExplosionButton
              ready={activeAbilityUsable}
              remaining={activeAbilityRemaining}
              disabled={controlsDisabled || activeAbilityLocked}
              onClick={activeAbilityPress}
            />
          );
        })()}

      {player.character === "babidi" &&
        (() => {
          abilitySlotsRef.current.push({
            click: babidiBombDropPress,
            disabled: controlsDisabled || !babidiBombDropUsable || isLocked("dimensionalPortal"),
            hold: false,
            abilityId: "dimensionalPortal",
          });
          abilitySlotsRef.current.push({
            click: fishingNetPress,
            disabled: controlsDisabled || !fishingNetUsable || isLocked("fishingNet"),
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
                disabled={controlsDisabled || !babidiBombDropUsable || isLocked("dimensionalPortal")}
                onClick={babidiBombDropPress}
              />
              <GenericAbilityButton
                characterId="babidi"
                abilityId="fishingNet"
                ready={fishingNetUsable}
                remaining={fishingNetRemaining}
                disabled={controlsDisabled || !fishingNetUsable || isLocked("fishingNet")}
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
            disabled: controlsDisabled || domainLocked,
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
              disabled={controlsDisabled || domainLocked}
              onClick={domainExpansionPress}
            />
          );
        })()}
    </div>
  );
}
