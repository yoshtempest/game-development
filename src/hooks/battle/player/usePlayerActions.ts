import { useCallback, useRef, useEffect } from "react";

import {
  PLAYER_BASIC_COOLDOWN,
  PLAYER_SPECIAL_COOLDOWN,
} from "@/data/cooldowns";
import { playAttackSound } from "@/utils/audio/playAttackSound";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { isPlayerInRange } from "@/gameRules/battle/range";
import { NPC_CLASS_HITBOX_BONUS } from "@/gameRules/battle/range/config";
import { isFacingTarget } from "@/gameRules/battle/direction";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import { damageSummon } from "@/gameRules/battle/damageSummon";
import type {
  VampirismSource,
  VampirismStats,
} from "@/gameRules/battle/vampirism/applyVampirism";
import { BLOCK_ATTACK_PUSH_DISTANCE } from "@/gameRules/movement/constants";
import { YVEL_WEAPON_RANGES } from "@/data/characters/yvel/yvelWeapons";
import { PlayerSpecialConstants } from "@/data/projectile";
import { useBuildTargetList } from "./usePlayerTargeting";
import { resetCooldownRef } from "@/utils/battle/cooldown";
import { EMATRON_COMBO_STEPS } from "@/data/characters/ematron";

import type { SummonedNpc } from "@/utils/types/npc/npc";
import type { SpecialHitOptions } from "@/utils/types/battle/specialHitOptions";
import type { CharactersProgress } from "@/data/characters/defaultProgress";
import type { BabidiTarget } from "@/utils/types/character/babidi";

type Props = {
  player: Player;
  npc: {
    x: number;
    y: number;
  };
  summons: SummonedNpc[];
  npcHP: number;
  npcClass: NPCClass;
  playerClass: PlayerClass;
  weapon?: YvelWeapon;
  progress: CharactersProgress;
  npcLevel: number;
  battle: {
    playerCooldown: React.RefObject<boolean>;
    isEnding: React.RefObject<boolean>;
    playerHit: (
      multiplier?: number,
      bypassCanPlayerHit?: boolean,
      bypassCooldown?: boolean,
    ) => void;
    specialHit: (
      multiplier?: number,
      bypassRangeCheck?: boolean,
      options?: SpecialHitOptions,
    ) => void;
    setDelicia: React.Dispatch<React.SetStateAction<number>>;
    hitsToSpecial: number;
  };

  setSummons: React.Dispatch<React.SetStateAction<SummonedNpc[]>>;

  giveSummonRewards: (npcClass: NPCClass) => void;

  spawnDamageRef: React.RefObject<
    (value: number, x: number, y: number, type: DamageType) => void
  >;
  registerHitRef: React.RefObject<(damage: number) => void>;

  setPlayerHP: React.Dispatch<React.SetStateAction<number>>;
  playerHP: number;
  playerMaxHp: number;
  vampirism: VampirismStats;
  onNpcPush?: (targetX: number) => void;
  /** Multiplicador do último step do combo do ematron (lido no press). */
  ematronComboMultiplierRef?: React.RefObject<number>;
  /** true quando o último press do ematron AVANÇOU o combo. */
  ematronComboActiveRef?: React.RefObject<boolean>;
  /** Combo do ematron: true durante a sequência aérea (airKick windup). */
  ematronComboAirActiveRef?: React.RefObject<boolean>;
  /** Índice do último step do combo do ematron (lido no press). */
  ematronComboStepIndexRef?: React.RefObject<number>;
  /** Avança o player um passo em direção ao alvo atingido (combo do ematron). */
  onComboAdvance?: (forwardDistance: number, targetX: number) => void;
  /** Básico do babidi: dispara o projétil no press (devolve se disparou). */
  babidiFireRef?: React.RefObject<
    ((player: Player, targets: BabidiTarget[]) => boolean) | null
  >;
  /** Colisão do projétil do babidi com um alvo (resolve o dano básico). */
  babidiOnHitRef?: React.RefObject<((target: BabidiTarget) => void) | null>;
  /** Fire do missile do babidi (withMissile). */
  babidiMissileFireRef?: React.RefObject<
    ((player: { x: number; y: number }) => boolean) | null
  >;
  /** Colisão do missile do babidi com um alvo. */
  babidiMissileOnHitRef?: React.RefObject<((target: BabidiTarget) => void) | null>;
  /** Modo de ataque básico do babidi selecionado pelo jogador. */
  babidiAttackMode?: "withGun" | "withMissile";
};

export function usePlayerBattleActions({
  player,
  npc,
  summons,
  npcHP,
  npcClass,
  playerClass,
  weapon,
  progress,
  battle,
  setSummons,
  giveSummonRewards,
  spawnDamageRef,
  registerHitRef,
  setPlayerHP,
  playerHP,
  playerMaxHp,
  vampirism,
  onNpcPush,
  ematronComboMultiplierRef,
  ematronComboActiveRef,
  ematronComboAirActiveRef,
  ematronComboStepIndexRef,
  onComboAdvance,
  babidiFireRef,
  babidiOnHitRef,
  babidiMissileFireRef,
  babidiMissileOnHitRef,
  babidiAttackMode,
}: Props) {
  const { playSound } = useSoundEffects();
  const fallingAttackUsedRef = useRef(false);

  useEffect(() => {
    if (player.y === player.groundY) {
      fallingAttackUsedRef.current = false;
    }
  }, [player.y, player.groundY]);

  const { getTargets, isInAttackRange } = useBuildTargetList(
    player,
    npc,
    npcHP,
    summons,
    npcClass,
    weapon,
  );

  const hitSummon = useCallback(
    (
      target: { id: string; x: number; y: number },
      multiplier: number,
      /** `basic` só paga vampirismo normal; o resto, só o universal. */
      source: VampirismSource,
      pushDir?: number,
    ) => {
      return damageSummon({
        target,
        multiplier,
        source,
        damageKind: "physical",
        player,
        playerClass,
        progress,
        playerHP,
        playerMaxHp,
        vampirism,
        summons,
        setSummons,
        giveSummonRewards,
        spawnDamageRef,
        registerHitRef,
        setPlayerHP,
        deliciaSetter: battle.setDelicia,
        hitsToSpecial: battle.hitsToSpecial,
        pushDir,
      });
    },
    [
      player,
      playerClass,
      progress,
      playerHP,
      playerMaxHp,
      vampirism,
      summons,
      setSummons,
      giveSummonRewards,
      spawnDamageRef,
      registerHitRef,
      setPlayerHP,
      battle,
    ],
  );

  // Impacto do projétil de energia do babidi: o básico não tem fase corpo a
  // corpo — o golpe É o projétil, resolvido aqui no momento da colisão (NPC
  // principal via playerHit com bypass de alcance/cooldown; summons pelo mesmo
  // pipeline do melee). Reatribuído a cada render para manter os closures
  // frescos (mesmo padrão do `refs.spawnDamageRef` no useBattleCombat).
  if (babidiOnHitRef) {
    babidiOnHitRef.current = (target) => {
      if (target.id === "main") {
        battle.playerHit(1, true, true);
        return;
      }
      const summon = summons.find((s) => s.id === target.id);
      if (!summon) return;
      hitSummon({ id: summon.id, x: summon.x, y: summon.y }, 1, "basic");
    };
  }
  if (babidiMissileOnHitRef) {
    babidiMissileOnHitRef.current = (target) => {
      if (target.id === "main") {
        battle.playerHit(1, true, true);
        return;
      }
      const summon = summons.find((s) => s.id === target.id);
      if (!summon) return;
      hitSummon({ id: summon.id, x: summon.x, y: summon.y }, 1, "basic");
    };
  }

  const hitTargetList = useCallback(
    (
      targets: { id: string; x: number; y: number }[],
      multiplier: number,
      isSpecial: boolean,
      /** Cauda de um special já disparado (explosão): não cobra carga de novo. */
      bypassCharge?: boolean,
    ) => {
      let hitMain = false;
      const pushDir = player.battleDirection === "right" ? 1 : -1;

      for (const target of targets) {
        if (target.id === "main") {
          hitMain = true;
          if (isSpecial) {
            battle.specialHit(multiplier, true, { bypassCharge });
          } else {
            onNpcPush?.(npc.x + pushDir * BLOCK_ATTACK_PUSH_DISTANCE);
            battle.playerHit(multiplier, true);
          }
          continue;
        }

        const targetSummon = summons.find((summon) => summon.id === target.id);
        if (!targetSummon) continue;

        hitSummon(
          target,
          multiplier,
          isSpecial ? "other" : "basic",
          isSpecial ? undefined : pushDir,
        );
      }

      if (!hitMain && !bypassCharge) {
        playAttackSound(player.character);
        resetCooldownRef(
          isSpecial ? PLAYER_SPECIAL_COOLDOWN : PLAYER_BASIC_COOLDOWN,
          battle.playerCooldown,
        );
      }
    },
    [player, npc.x, battle, onNpcPush, summons, hitSummon],
  );

  const handlePlayerHit = useCallback(() => {
    // Combo do ematron: o multiplicador vem do passo avançado no último press
    // (sinal síncrono setado pelo attack() no useBattleMovement). Usamos
    // bypassCooldown=true porque o pacing do combo é a janela de 300ms, não o
    // cooldown básico de 400ms.
    const isEmatronComboHit =
      player.character === "ematron" &&
      ematronComboActiveRef?.current === true &&
      ematronComboMultiplierRef != null;
    const comboMultiplier = isEmatronComboHit
      ? (ematronComboMultiplierRef.current ?? 1)
      : 1;

    // Uma instância de dano por sprite do combo do ematron: presses repetidos
    // durante a exibição de um golpe (mash/hold) que NÃO avançaram o combo não
    // podem vazar dano pelo caminho normal (cooldown básico de 400ms).
    if (
      player.character === "ematron" &&
      player.mode === "battle" &&
      !isEmatronComboHit &&
      (player.state === "preAttack" ||
        ALL_PREDICATES.isCombo(player.state) ||
        (player.state === "jump" && ematronComboAirActiveRef?.current === true))
    ) {
      return;
    }

    if (battle.isEnding.current) return;
    if (!isEmatronComboHit && !battle.playerCooldown.current) {
      return;
    }

    const targets = getTargets();
    const mainTarget = targets.find((t) => t.id === "main");

    // Babidi: o básico é um projétil — no modo withGun é o disparo de energia
    // (poses de mão); no modo withMissile é o missile teleguiado. Em ambos o
    // dano acontece na colisão do projétil com o alvo.
    if (player.character === "babidi") {
      if (babidiAttackMode === "withMissile") {
        const fired = babidiMissileFireRef?.current?.(player) ?? false;
        if (fired) {
          playSound("missile");
          resetCooldownRef(PLAYER_BASIC_COOLDOWN, battle.playerCooldown);
        }
        return;
      }
      const fired = babidiFireRef?.current?.(player, targets) ?? false;
      if (fired) {
        playSound("shot");
        resetCooldownRef(PLAYER_BASIC_COOLDOWN, battle.playerCooldown);
      }
      return;
    }

    if (player.state === "blocked") {
      const areaTargets = targets.filter(
        (target) =>
          isPlayerInRange(
            player.x,
            player.y,
            target.x,
            target.y,
            player.state,
            player.character,
            false,
            true,
            target.id === "main" ? npcClass : "common",
            weapon && player.character === "yvel"
              ? YVEL_WEAPON_RANGES[weapon]
              : undefined,
          ) &&
          isFacingTarget(
            player.x,
            player.y,
            target.x,
            target.y,
            player.battleDirection,
          ),
      );

      if (areaTargets.length === 0) return;

      hitTargetList(areaTargets, 0.7, false);
      return;
    }

    // Priority 1: hit main NPC (boss) if in range
    if (mainTarget && isInAttackRange(mainTarget)) {
      if (isEmatronComboHit) {
        const stepIndex = ematronComboStepIndexRef?.current ?? 0;
        const step = EMATRON_COMBO_STEPS[stepIndex] ?? EMATRON_COMBO_STEPS[0];
        const pushDir = player.battleDirection === "right" ? 1 : -1;
        onNpcPush?.(npc.x + pushDir * step.pushDistance);
        onComboAdvance?.(step.forwardDistance, mainTarget.x);
        battle.playerHit(comboMultiplier, false, true);
      } else if (player.state === "falling" && !fallingAttackUsedRef.current) {
        fallingAttackUsedRef.current = true;
        battle.playerHit(1.2);
      } else {
        battle.playerHit();
      }
      return;
    }

    // Priority 2: hit the closest summon in range (only one per attack)
    for (const target of targets) {
      if (target.id === "main") continue;
      if (!isInAttackRange(target)) continue;

      const targetSummon = summons.find((summon) => summon.id === target.id);
      if (!targetSummon) continue;

      playAttackSound(player.character);
      const pushDir = player.battleDirection === "right" ? 1 : -1;
      hitSummon(
        target,
        isEmatronComboHit ? comboMultiplier : 1,
        "basic",
        isEmatronComboHit ? pushDir : undefined,
      );

      if (isEmatronComboHit) {
        const stepIndex = ematronComboStepIndexRef?.current ?? 0;
        const step = EMATRON_COMBO_STEPS[stepIndex] ?? EMATRON_COMBO_STEPS[0];
        onComboAdvance?.(step.forwardDistance, target.x);
      } else {
        resetCooldownRef(PLAYER_BASIC_COOLDOWN, battle.playerCooldown);
      }

      return;
    }
  }, [
    player,
    summons,
    battle,
    getTargets,
    isInAttackRange,
    hitSummon,
    hitTargetList,
    npcClass,
    weapon,
    npc.x,
    onNpcPush,
    ematronComboMultiplierRef,
    ematronComboActiveRef,
    ematronComboAirActiveRef,
    ematronComboStepIndexRef,
    onComboAdvance,
    babidiFireRef,
    babidiMissileFireRef,
    babidiAttackMode,
    playSound,
  ]);

  const handleExtraPunch = useCallback(
    (multiplier: number): { x: number; y: number; isMain: boolean } | null => {
      if (battle.isEnding.current) return null;

      const targets = getTargets();
      const mainTarget = targets.find((t) => t.id === "main");

      if (mainTarget && isInAttackRange(mainTarget)) {
        battle.playerHit(multiplier, true, true);
        return { x: mainTarget.x, y: mainTarget.y, isMain: true };
      }

      for (const target of targets) {
        if (target.id === "main") continue;
        if (!isInAttackRange(target)) continue;

        const targetSummon = summons.find((summon) => summon.id === target.id);
        if (!targetSummon) continue;

        // Punch extra do ORA: é golpe de especial (cobra carga de special),
        // então só o vampirismo universal paga.
        hitSummon(target, multiplier, "other");
        return { x: target.x, y: target.y, isMain: false };
      }

      return null;
    },
    [battle, getTargets, isInAttackRange, summons, hitSummon],
  );

  const handleSpecialHit = useCallback(() => {
    if (!battle.playerCooldown.current || battle.isEnding.current) {
      return;
    }

    const targets = getTargets();

    // Golpe aéreo: no ar (subindo ou caindo) ou na sequência da habilidade aérea.
    const isAirStrike =
      ALL_PREDICATES.isAirFalling(player.state) ||
      ALL_PREDICATES.isAirAbility(player.state);

    if (isAirStrike) {
      const inRangeTargets = targets.filter(
        (target) =>
          Math.abs(player.x - target.x) <
          150 + (target.id === "main" ? NPC_CLASS_HITBOX_BONUS[npcClass] : 0),
      );

      // Whiff não zera mais a carga: a barra é só da Expansão de Domínio e o
      // especial paga com cooldown (botão na tela).
      if (inRangeTargets.length === 0) {
        return;
      }

      hitTargetList(inRangeTargets, 1.2, true);
      return;
    }

    if (player.character === "natsuki") {
      const dir = player.battleDirection === "right" ? 1 : -1;
      const inProjectileLine = (target: { x: number }) => {
        const dx = target.x - player.x;
        return (
          (dir === 1 ? dx >= 0 : dx <= 0) &&
          Math.abs(dx) <= PlayerSpecialConstants.FIRE_DISTANCE
        );
      };

      const pathTargets = targets.filter(inProjectileLine);
      const mainTarget = pathTargets.find((target) => target.id === "main");
      const summonTargets = pathTargets.filter(
        (target) => target.id !== "main",
      );

      if (mainTarget) {
        battle.specialHit();
      }

      for (const target of summonTargets) {
        const targetSummon = summons.find((summon) => summon.id === target.id);
        if (!targetSummon) continue;
        hitSummon(target, 1, "other", dir);
      }

      return;
    }

    for (const target of targets) {
      if (target.id === "main") {
        battle.specialHit();
        return;
      }
    }
  }, [
    battle,
    getTargets,
    player.state,
    player.x,
    player.battleDirection,
    player.character,
    summons,
    hitSummon,
    hitTargetList,
    npcClass,
  ]);

  return {
    handlePlayerHit,
    handleSpecialHit,
    handleExtraPunch,
    hitTargetList,
  };
}
