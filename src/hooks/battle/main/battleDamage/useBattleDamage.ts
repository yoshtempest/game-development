import { useCallback, useMemo, useRef } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { combatService } from "@/services/combat";
import { cursedEnergyFromDamage } from "@/gameRules/battle/cursedEnergy";
import { rollEnchantmentProc } from "@/gameRules/battle/equipment";
import { ENCHANTMENT_DURATION_MS } from "@/data/equipment/enchantments";
import {
  VASTOLORD_DAMAGE_EXTEND_MS,
  VASTOLORD_DAMAGE_EXTEND_RATIO,
} from "@/hooks/battle/player/characters/marshadow/vastolordForm/useVastolordForm";
import { getAbilityDamageType } from "@/data/characters/abilities";
import { damageSummon } from "@/gameRules/battle/damageSummon";
import {
  ATOMIC_TARGET_MULTIPLIER,
  ATOMIC_AREA_MULTIPLIER,
} from "@/hooks/battle/player/characters/marshadow/atomic/useAtomic";
import {
  DOMAIN_BURST_MAIN_MULTIPLIER,
  DOMAIN_BURST_SUMMON_MULTIPLIER,
} from "@/hooks/battle/utilities/domainExpansionBurst/useDomainExpansionBurst";
import type { AtomicBoomPayload } from "@/utils/types/battle/atomic";
import type { BattleDamageProps } from "./types";

/**
 * Núcleo do pipeline de dano (`useBattleDamage`): a base sobre a qual o
 * restante do combate aplica golpes (especial, área, encantamento, Vastolord).
 *
 * - `registerHitRef`: entrada única do pipeline do player — registra o combo,
 *   aplica a extensão da Forma Vastolord, recupera a mana por dano e o
 *   encantamento da arma.
 * - Handlers de dano especial/área (`playerHit` + `damageSummon` pros summons).
 */
export function useBattleDamage({
  battle,
  registerHit,
  refs,
  npc,
  player,
  playerClass,
  progress,
  summons,
  setSummons,
  giveSummonRewards,
  battleManaRef,
  cursedEnergyEnabled,
  vastolordActive,
  extendVastolordRef,
  weaponEnchantmentRef,
  npcEnchantUntilRef,
}: BattleDamageProps) {
  const vastolordBaseDamage = useMemo(
    () =>
      combatService.calculatePlayerDamage(
        battle.char.stats.strength,
        playerClass,
      ),
    [battle.char, playerClass],
  );
  const vastolordDamageAccumulatorRef = useRef(0);

  // Funil único de dano do player: combo + extensão da Forma Vastolord +
  // recuperação de mana por dano + encantamento da arma.
  const registerHitRef = useLatestRef((damage: number) => {
    registerHit(damage);

    if (vastolordActive) {
      vastolordDamageAccumulatorRef.current += damage;
      const threshold = vastolordBaseDamage * VASTOLORD_DAMAGE_EXTEND_RATIO;
      if (threshold >= 1) {
        while (vastolordDamageAccumulatorRef.current >= threshold) {
          vastolordDamageAccumulatorRef.current -= threshold;
          extendVastolordRef.current(VASTOLORD_DAMAGE_EXTEND_MS);
        }
      }
    }

    if (cursedEnergyEnabled) {
      battleManaRef.current?.restoreMana(cursedEnergyFromDamage(damage));
    }

    const enchantment = weaponEnchantmentRef.current;
    if (!rollEnchantmentProc(enchantment) || !enchantment) return;

    const until = Date.now() + ENCHANTMENT_DURATION_MS[enchantment];
    npcEnchantUntilRef.current[enchantment] = until;

    if (enchantment === "freeze") {
      refs.npcStaggerRef.current = Math.max(refs.npcStaggerRef.current, until);
    }

    refs.spawnDamageRef.current?.(0, npc.x, npc.y, enchantment);
  });

  refs.registerHitRef.current = registerHitRef.current;
  refs.spawnDamageRef.current = battle.spawnDamageNumber;

  // Proporção especial/básico: o dano de uma habilidade especial equivale a
  // `ratio` vezes o básico (usada por atomic e domainBurst para escalar).
  const specialDamageRatio = useMemo(() => {
    const special = combatService.calculateSpecialDamage(
      battle.char.stats.spirit,
      playerClass,
    );
    const basic = combatService.calculatePlayerDamage(
      battle.char.stats.strength,
      playerClass,
    );
    return basic > 0 ? special / basic : 1;
  }, [battle.char.stats.spirit, battle.char.stats.strength, playerClass]);

  const handleGenkiDamaExplode = useCallback(
    (x: number, y: number, radius: number, multiplier: number) => {
      if (battle.isEnding.current) return;

      const genkiDamaDamageKind = getAbilityDamageType("genkiDama");

      if (Math.hypot(npc.x - x, npc.y - y) <= radius) {
        battle.playerHit(multiplier, true, true, genkiDamaDamageKind);
      }

      for (const summon of summons) {
        if (Math.hypot(summon.x - x, summon.y - y) > radius) continue;
        damageSummon({
          target: { id: summon.id, x: summon.x, y: summon.y },
          multiplier,
          source: "other",
          damageKind: genkiDamaDamageKind,
          player,
          playerClass,
          progress,
          playerHP: battle.playerHP,
          playerMaxHp: battle.playerMaxHp,
          vampirism: battle.vampirism,
          summons,
          setSummons,
          giveSummonRewards,
          spawnDamageRef: refs.spawnDamageRef,
          registerHitRef: refs.registerHitRef,
          setPlayerHP: battle.setPlayerHP,
          deliciaSetter: battle.setDelicia,
          hitsToSpecial: battle.hitsToSpecial,
        });
      }
    },
    [
      battle,
      npc.x,
      npc.y,
      player,
      playerClass,
      progress,
      refs,
      setSummons,
      summons,
      giveSummonRewards,
    ],
  );

  const { strikeProjectiles } = npc;

  const handleAtomicBoom = useCallback(
    (payload: AtomicBoomPayload) => {
      if (battle.isEnding.current) return;

      const { targetId, hitMain, hitSummonIds, hitProjectileIds } = payload;

      // Projéteis no raio: special com o fator de área (o alvo da explosão é
      // sempre um inimigo, nunca um projétil). `strikeState: "ability"` porque
      // no boom o jogador está em `finalizatingAtomic`, que o resolvedor de
      // dano trataria como básico.
      strikeProjectiles(
        hitProjectileIds.map((id) => ({
          id,
          multiplier: ATOMIC_AREA_MULTIPLIER,
        })),
        {
          strikeState: "ability",
          damageKind: getAbilityDamageType("iAmAtomic"),
        },
      );

      // NPC principal: dano especial — 2x se for o alvo (maior vida máxima).
      if (hitMain) {
        const factor =
          targetId === "main"
            ? ATOMIC_TARGET_MULTIPLIER
            : ATOMIC_AREA_MULTIPLIER;
        battle.playerHit(
          factor * specialDamageRatio,
          true,
          true,
          getAbilityDamageType("iAmAtomic"),
        );
      }

      for (const summon of summons) {
        if (!hitSummonIds.includes(summon.id)) continue;
        const factor =
          targetId === summon.id
            ? ATOMIC_TARGET_MULTIPLIER
            : ATOMIC_AREA_MULTIPLIER;
        damageSummon({
          target: { id: summon.id, x: summon.x, y: summon.y },
          multiplier: factor * specialDamageRatio,
          source: "other",
          damageKind: getAbilityDamageType("iAmAtomic"),
          player,
          playerClass,
          progress,
          playerHP: battle.playerHP,
          playerMaxHp: battle.playerMaxHp,
          vampirism: battle.vampirism,
          summons,
          setSummons,
          giveSummonRewards,
          spawnDamageRef: refs.spawnDamageRef,
          registerHitRef: refs.registerHitRef,
          setPlayerHP: battle.setPlayerHP,
          deliciaSetter: battle.setDelicia,
          hitsToSpecial: battle.hitsToSpecial,
        });
      }
    },
    [
      specialDamageRatio,
      strikeProjectiles,
      battle,
      giveSummonRewards,
      player,
      playerClass,
      progress,
      refs,
      setSummons,
      summons,
    ],
  );

  /**
   * Expansão de Domínio (burst): dano especial em TODOS os inimigos da arena.
   * Os fatores vêm do `DomainExpansionDefinition` resolvido — variante de forma
   * (ex.: Vastolord) bate mais forte pelo mesmo funil.
   */
  const handleDomainBurst = useCallback(
    (
      mainMultiplier: number = DOMAIN_BURST_MAIN_MULTIPLIER,
      summonMultiplier: number = DOMAIN_BURST_SUMMON_MULTIPLIER,
    ) => {
      if (battle.isEnding.current) return;

      const burstKind = getAbilityDamageType("domainBurst");

      battle.playerHit(
        mainMultiplier * specialDamageRatio,
        true,
        true,
        burstKind,
      );

      for (const summon of summons) {
        damageSummon({
          target: { id: summon.id, x: summon.x, y: summon.y },
          multiplier: summonMultiplier * specialDamageRatio,
          source: "other",
          damageKind: burstKind,
          player,
          playerClass,
          progress,
          playerHP: battle.playerHP,
          playerMaxHp: battle.playerMaxHp,
          vampirism: battle.vampirism,
          summons,
          setSummons,
          giveSummonRewards,
          spawnDamageRef: refs.spawnDamageRef,
          registerHitRef: refs.registerHitRef,
          setPlayerHP: battle.setPlayerHP,
          deliciaSetter: battle.setDelicia,
          hitsToSpecial: battle.hitsToSpecial,
        });
      }
    },
    [
      battle,
      giveSummonRewards,
      player,
      playerClass,
      progress,
      refs,
      setSummons,
      summons,
      specialDamageRatio,
    ],
  );

  return {
    registerHitRef,
    handleGenkiDamaExplode,
    handleAtomicBoom,
    handleDomainBurst,
    specialDamageRatio,
  };
}
