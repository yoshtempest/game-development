import { useState, useCallback } from "react";
import {
  PLAYER_BASIC_COOLDOWN,
  PLAYER_SPECIAL_COOLDOWN,
} from "@/data/cooldowns";
import { canPlayerHit } from "@/gameRules/battle/combat";
import { evaluateStatusGuards } from "@/gameRules/battle/status/evaluateStatusGuards";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import { LUCAS_WEAPON_RANGES } from "@/data/characters/lucas/lucasWeapons";
import { DIVERGENT_FIST_DELAY_MS } from "@/gameRules/battle/cursedEnergy";
import {
  applyBasicHit,
  applySpecialHit,
  calculateBasicHitDamage,
  calculateSpecialHitDamage,
} from "@/gameRules/battle/applyHit";
import {
  isPlayerBlind,
  isPlayerFrozen,
  isPlayerParalyzed,
} from "@/gameRules/battle/status/statusEffects";
import type { BattleBehavior } from "@/utils/types/player/behavior";
import type { VampirismStats } from "@/gameRules/battle/vampirism/applyVampirism";
import type { CharacterProgress } from "@/data/characters/defaultProgress";
import type { ElementType } from "@/utils/types/battle/element";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { logPlay } from "@/utils/replay/audioEventLog";
import { runHitPrelude } from "@/hooks/battle/player/runHitPrelude";
import { resetCooldownRef } from "@/utils/battle/cooldown";
import type { OnBeforeNpcHit } from "@/hooks/battle/npc/useBlocking";
import type {
  ProjectileHit,
  ProjectileHitDamageFn,
  ProjectileHitResolveOptions,
} from "@/utils/types/battle/projectileHit";
import type { SpecialHitOptions } from "@/utils/types/battle/specialHitOptions";
import type { DamageArmor, DamageKind } from "@/utils/types/battle/damageKind";
import { type TimeEffect } from "@/gameRules/battle/time";

type Props = {
  player: Player;
  playerClass: PlayerClass;
  char: CharacterProgress;
  behavior: BattleBehavior;

  playerX: number;
  playerY: number;
  npcX: number;
  npcY: number;
  playerState: PlayerState;
  npcClass: NPCClass;
  npcElementTypes: readonly ElementType[];
  weapon?: LucasWeapon;

  HITS_TO_SPECIAL: number;

  setNpcHP: React.Dispatch<React.SetStateAction<number>>;
  setPlayerHP: React.Dispatch<React.SetStateAction<number>>;
  playerHP: number;
  playerMaxHp: number;
  vampirism: VampirismStats;
  totalMaxHpDamage: number;
  totalTrueDamage: number;
  playerCooldown: React.RefObject<boolean>;
  /** Recebe o resolvedor do dano do golpe ativo (lido pelo useProjectile). */
  playerHitDamageRef: React.RefObject<ProjectileHitDamageFn>;
  isEnding: React.RefObject<boolean>;

  spawnPiercing: () => void;
  triggerExplosion: () => void;
  titleDamageBonus: number;
  elementDamageBonus: number;
  critRate: number;
  npcArmor: DamageArmor;
  spawnDamageRef: React.RefObject<
    (value: number, x: number, y: number, type: DamageType) => void
  >;
  timeRef: React.RefObject<TimeEffect[]>;
  registerHitRef: React.RefObject<(damage: number) => void>;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  /** Devolve o multiplicador atual do ataque básico do artur (escala ORA). */
  arturOraMultiplierRef?: React.RefObject<() => number>;
  /** Devolve o multiplicador atual da Forma Vastolord do marcelo. */
  vastolordMultiplierRef?: React.RefObject<() => number>;
  /** Punho Divergente do riquelme: true quando o próximo ataque dobra o dano. */
  divergentFistRef?: React.RefObject<boolean>;
  /** Dispara quando o Punho Divergente é consumido pelo golpe. */
  onDivergentFistConsumedRef?: React.RefObject<() => void>;
  onBeforeNpcHitRef?: React.RefObject<OnBeforeNpcHit>;
  onDamageDealtRef?: React.RefObject<(amount: number) => void>;
  onAttackRef?: React.RefObject<() => void>;
  onSpecialRef?: React.RefObject<() => void>;
  onKokusenRef?: React.RefObject<() => void>;
  onBlackFlashRef?: React.RefObject<() => void>;
  onCriticalPushRef?: React.RefObject<() => void>;
  /** Dispara quando o marcelo (forma padrão) acerta um ataque básico no NPC. */
  onMarceloDefaultHitRef?: React.RefObject<() => void>;
  onHalfHeal?: () => void;
};

export function usePlayerBattle({
  player,
  playerClass,
  char,
  behavior,
  HITS_TO_SPECIAL,
  setNpcHP,
  setPlayerHP,
  playerHP,
  playerMaxHp,
  vampirism,
  totalMaxHpDamage,
  totalTrueDamage,
  playerCooldown,
  playerHitDamageRef,
  isEnding,
  playerX,
  playerY,
  npcX,
  npcY,
  playerState,
  npcClass,
  npcElementTypes,
  weapon,
  spawnPiercing,
  triggerExplosion,
  titleDamageBonus,
  elementDamageBonus,
  critRate,
  npcArmor,
  spawnDamageRef,
  timeRef,
  registerHitRef,
  setPlayer,
  arturOraMultiplierRef,
  vastolordMultiplierRef,
  divergentFistRef,
  onDivergentFistConsumedRef,
  onBeforeNpcHitRef,
  onDamageDealtRef,
  onAttackRef,
  onSpecialRef,
  onKokusenRef,
  onBlackFlashRef,
  onCriticalPushRef,
  onMarceloDefaultHitRef,
  onHalfHeal,
}: Props) {
  const { playSound } = useSoundEffects();

  const [delicia, setDelicia] = useState(0);
  const [stacks, setStacks] = useState(0);

  const playerHit = useCallback(
    (
      damageMultiplier = 1,
      bypassCanPlayerHit = false,
      bypassCooldown = false,
      damageKind: DamageKind = "physical",
    ) => {
      if (isEnding.current) return;
      if (!playerCooldown.current && !bypassCooldown) return;

      // Ataque básico do artur escala pelo count de extraPunches na tela.
      // Forma Vastolord multiplica o dano do marcelo por 4.
      const vastolordMult = vastolordMultiplierRef?.current?.() ?? 1;
      const mult =
        (arturOraMultiplierRef?.current &&
        player.character === "artur" &&
        damageMultiplier === 1
          ? (arturOraMultiplierRef.current() ?? damageMultiplier)
          : damageMultiplier) * vastolordMult;

      const guard = evaluateStatusGuards(player);
      if (guard === "frozen") return;

      // CutInEnemie + chance de sangramento: só no ataque básico do marcelo em
      // forma padrão (Forma Vastolord multiplica o dano, então é excluída).
      const isMarceloDefaultHit =
        player.character === "marcelo" && vastolordMult === 1;
      const notifyMarceloDefaultHit = () => {
        if (isMarceloDefaultHit) onMarceloDefaultHitRef?.current?.();
      };

      if (
        !bypassCanPlayerHit &&
        !canPlayerHit({
          playerX,
          playerY,
          npcX,
          npcY,
          playerState,
          character: player.character,
          direction: player.battleDirection,
          isSpecial: false,
          npcClass,
          rangeOverride: weapon ? LUCAS_WEAPON_RANGES[weapon] : undefined,
        })
      ) {
        return;
      }

      // Cegueira, bloqueio e confusão formam a mesma passagem para todo golpe
      // do jogador; o básico só acrescenta o cut-in do marcelo quando bloqueado.
      const outcome = runHitPrelude({
        guard,
        calculateDamage: (targetElements) =>
          calculateBasicHitDamage({
            player,
            playerClass,
            char,
            titleDamageBonus,
            elementDamageBonus,
            critRate,
            npcArmor,
            npcElementTypes: targetElements,
            playerHP,
            playerMaxHp,
            totalMaxHpDamage,
            totalTrueDamage,
            damageMultiplier: mult,
            damageKind,
          }),
        npcElements: npcElementTypes,
        cooldownMs: PLAYER_BASIC_COOLDOWN,
        playerCooldown,
        onBlocked: notifyMarceloDefaultHit,
        onBeforeNpcHitRef,
        setNpcHP,
        setPlayerHP,
        vampirism,
        playerMaxHp,
        source: "basic",
        registerHitRef,
        onDamageDealtRef,
        spawnDamageRef,
        npcX,
        npcY,
        playerX,
        playerY,
      });
      if (outcome.kind !== "proceed") return;

      const runBasicHit = () =>
        applyBasicHit({
          player,
          playerClass,
          char,
          behavior,
          titleDamageBonus,
          elementDamageBonus,
          critRate,
          npcArmor,
          npcElementTypes,
          playerHP,
          playerMaxHp,
          vampirism,
          totalMaxHpDamage,
          totalTrueDamage,
          setNpcHP,
          setPlayerHP,
          setPlayer,
          spawnDamageRef,
          registerHitRef,
          timeRef,
          onDamageDealtRef,
          onAttackRef,
          onKokusenRef,
          onBlackFlashRef,
          onCriticalPushRef,
          damageMultiplier: mult,
          damageKind,
          npcX,
          npcY,
          spawnPiercing,
          setDelicia,
          setStacks,
          HITS_TO_SPECIAL,
        });

      const isDivergentFist = divergentFistRef?.current === true;
      notifyMarceloDefaultHit();
      runBasicHit();

      if (isDivergentFist) {
        divergentFistRef.current = false;
        onDivergentFistConsumedRef?.current?.();
        setTimeout(() => {
          if (isEnding.current) return;
          onCriticalPushRef?.current?.();
          runBasicHit();
        }, DIVERGENT_FIST_DELAY_MS);
      }

      if (onHalfHeal) onHalfHeal();

      resetCooldownRef(PLAYER_BASIC_COOLDOWN, playerCooldown);
    },
    [
      isEnding,
      player,
      playerCooldown,
      playerX,
      playerY,
      npcX,
      npcY,
      playerState,
      behavior,
      char,
      playerClass,
      setNpcHP,
      HITS_TO_SPECIAL,
      spawnPiercing,
      titleDamageBonus,
      elementDamageBonus,
      spawnDamageRef,
      timeRef,
      registerHitRef,
      onDamageDealtRef,
      critRate,
      npcArmor,
      playerHP,
      setPlayerHP,
      playerMaxHp,
      vampirism,
      totalMaxHpDamage,
      totalTrueDamage,
      onBeforeNpcHitRef,
      setPlayer,
      onAttackRef,
      onKokusenRef,
      onBlackFlashRef,
      onCriticalPushRef,
      onMarceloDefaultHitRef,
      onHalfHeal,
      npcClass,
      npcElementTypes,
      weapon,
      arturOraMultiplierRef,
      vastolordMultiplierRef,
      divergentFistRef,
      onDivergentFistConsumedRef,
    ],
  );

  const specialHit = useCallback(
    (
      damageMultiplier = 1,
      bypassRangeCheck = false,
      options?: SpecialHitOptions,
    ) => {
      if (isEnding.current) return;
      // Explosão de área (Killer Queen) é a cauda de um special que já pagou o
      // cooldown: reprovar aqui deixaria a área inteira inerte. A carga não
      // entra mais nesta conta — o especial não consome mais delícia.
      if (!options?.bypassCharge && !playerCooldown.current) return;

      const vastolordMult = vastolordMultiplierRef?.current?.() ?? 1;
      const totalMultiplier = damageMultiplier * vastolordMult;

      const guard = evaluateStatusGuards(player);
      if (guard === "frozen") return;

      if (
        !bypassRangeCheck &&
        !canPlayerHit({
          playerX,
          playerY,
          npcX,
          npcY,
          playerState,
          character: player.character,
          direction: player.battleDirection,
          isSpecial: true,
          npcClass,
          rangeOverride: weapon ? LUCAS_WEAPON_RANGES[weapon] : undefined,
        })
      ) {
        return;
      }

      // Mesma passagem do ataque básico (cegueira, bloqueio, confusão). O
      // special zera a delícia nos desfechos que gastaram o combo, mas não
      // avisa o cut-in do marcelo: esse aviso é exclusivo do golpe básico.
      const outcome = runHitPrelude({
        guard,
        calculateDamage: (targetElements) =>
          calculateSpecialHitDamage({
            player,
            playerClass,
            char,
            elementDamageBonus,
            critRate,
            npcArmor,
            npcElementTypes: targetElements,
            playerHP,
            playerMaxHp,
            totalMaxHpDamage,
            totalTrueDamage,
            damageMultiplier: totalMultiplier,
            damageKind: options?.damageKind ?? "physical",
            stacks,
          }),
        npcElements: npcElementTypes,
        cooldownMs: PLAYER_SPECIAL_COOLDOWN,
        playerCooldown,
        onBlind: () => setDelicia(0),
        onSelfDamage: () => setDelicia(0),
        onBeforeNpcHitRef,
        setNpcHP,
        setPlayerHP,
        vampirism,
        playerMaxHp,
        source: "other",
        registerHitRef,
        onDamageDealtRef,
        spawnDamageRef,
        npcX,
        npcY,
        playerX,
        playerY,
      });
      if (outcome.kind !== "proceed") return;

      if (player.character === "riquelme") {
        playSound("impact");
        logPlay("impact");
      }

      applySpecialHit({
        player,
        playerClass,
        char,
        behavior,
        titleDamageBonus,
        elementDamageBonus,
        critRate,
        npcArmor,
        npcElementTypes,
        playerHP,
        playerMaxHp,
        vampirism,
        totalMaxHpDamage,
        totalTrueDamage,
        damageKind: options?.damageKind ?? "physical",
        setNpcHP,
        setPlayerHP,
        setPlayer,
        spawnDamageRef,
        registerHitRef,
        timeRef,
        onDamageDealtRef,
        onSpecialRef: options?.bypassCharge ? undefined : onSpecialRef,
        onKokusenRef,
        onBlackFlashRef,
        onCriticalPushRef,
        damageMultiplier: totalMultiplier,
        npcX,
        npcY,
        stacks,
        setStacks,
        triggerExplosion,
        setDelicia,
        hitsToSpecial: HITS_TO_SPECIAL,
      });

      // A cauda do special não cura de novo nem rearma o cooldown: a Queen já
      // congelou o jogador por ~5s, e travar o ataque ao final dela seria um
      // custo invisível.
      if (options?.bypassCharge) return;

      if (onHalfHeal) onHalfHeal();

      resetCooldownRef(PLAYER_SPECIAL_COOLDOWN, playerCooldown);
    },
    [
      isEnding,
      player,
      HITS_TO_SPECIAL,
      playerCooldown,
      playerX,
      playerY,
      npcX,
      npcY,
      playerState,
      behavior,
      char,
      playerClass,
      setNpcHP,
      setPlayerHP,
      playerMaxHp,
      vampirism,
      totalMaxHpDamage,
      totalTrueDamage,
      stacks,
      triggerExplosion,
      spawnDamageRef,
      timeRef,
      registerHitRef,
      onDamageDealtRef,
      critRate,
      npcArmor,
      playerHP,
      onBeforeNpcHitRef,
      setPlayer,
      onSpecialRef,
      onKokusenRef,
      onBlackFlashRef,
      onCriticalPushRef,
      onHalfHeal,
      playSound,
      titleDamageBonus,
      elementDamageBonus,
      npcClass,
      npcElementTypes,
      weapon,
      vastolordMultiplierRef,
    ],
  );

  /**
   * Dano do golpe ativo para o estado informado, resolvido pelo mesmo pipeline
   * de `playerHit`/`specialHit`. Consumido pelo `useProjectile` para que um
   * projétil levar exatamente o dano que o NPC levaria. `null` = o golpe não
   * causa dano agora (jogador congelado/cego).
   */
  const resolveProjectileHit = useCallback(
    (
      strikeState: PlayerState,
      options?: ProjectileHitResolveOptions,
    ): ProjectileHit | null => {
      // Guardas determinísticos: "confused" fica de fora de propósito (o
      // `evaluateStatusGuards` sorteia 50% e o projétil não deve divergir do
      // que o `playerHit` decide).
      if (
        isPlayerFrozen(player) ||
        isPlayerParalyzed(player) ||
        isPlayerBlind(player)
      ) {
        return null;
      }

      if (ALL_PREDICATES.isSpecialStrike(strikeState)) {
        const { damage } = calculateSpecialHitDamage({
          player,
          playerClass,
          char,
          elementDamageBonus,
          critRate,
          npcArmor,
          npcElementTypes,
          playerHP,
          playerMaxHp,
          totalMaxHpDamage,
          totalTrueDamage,
          damageMultiplier: vastolordMultiplierRef?.current?.() ?? 1,
          damageKind: options?.damageKind ?? "physical",
          stacks,
        });
        return { damage, type: "projectile" };
      }

      // Escala ORA do artur (só no ataque básico com multiplicador 1) e a Forma
      // Vastolord do marcelo — mesma conta do `playerHit`.
      const vastolordMult = vastolordMultiplierRef?.current?.() ?? 1;
      const mult =
        (arturOraMultiplierRef?.current && player.character === "artur"
          ? arturOraMultiplierRef.current()
          : 1) * vastolordMult;

      const { damage } = calculateBasicHitDamage({
        player,
        playerClass,
        char,
        titleDamageBonus,
        elementDamageBonus,
        critRate,
        npcArmor,
        npcElementTypes,
        playerHP,
        playerMaxHp,
        totalMaxHpDamage,
        totalTrueDamage,
        damageMultiplier: mult,
        damageKind: "physical",
      });
      return { damage, type: "projectile" };
    },
    [
      player,
      playerClass,
      char,
      titleDamageBonus,
      elementDamageBonus,
      critRate,
      npcArmor,
      npcElementTypes,
      playerHP,
      playerMaxHp,
      totalMaxHpDamage,
      totalTrueDamage,
      stacks,
      arturOraMultiplierRef,
      vastolordMultiplierRef,
    ],
  );

  // Escrito a cada render (padrão do battle) para o useProjectile, montado antes
  // deste hook, conseguir ler o dano do golpe vigente.
  playerHitDamageRef.current = resolveProjectileHit;

  return {
    delicia,
    stacks,
    setStacks,
    setDelicia,
    playerHit,
    specialHit,
  };
}
