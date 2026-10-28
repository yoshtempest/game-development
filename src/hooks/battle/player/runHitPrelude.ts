import type { RefObject } from "react";

import { resetCooldownRef } from "@/utils/battle/cooldown";
import { applyVampirism } from "@/gameRules/battle/vampirism/applyVampirism";
import type {
  VampirismSource,
  VampirismStats,
} from "@/gameRules/battle/vampirism/applyVampirism";
import type { OnBeforeNpcHit } from "@/hooks/battle/npc/useBlocking";
import type { ElementType } from "@/utils/types/battle/element";

/** Cooldown que este golpe consome e o que precisa ser rearmado ao abortar. */
export type HitPreludeConfig = {
  /**
   * Dano do golpe. Recebe os elementos do alvo: no golpe normal são os do
   * NPC, na autolesão da confusão são vazios (por isso função, não número).
   */
  calculateDamage: (npcElements: readonly ElementType[]) => { damage: number };
  /** Elementos do NPC, usados no dano do golpe normal. */
  npcElements: readonly ElementType[];
  /** Cooldown a rearmar em qualquer saída antecipada. */
  cooldownMs: number;
  playerCooldown: RefObject<boolean>;
  /** Efeito colateral ao errar por cegueira. O special zera a delícia. */
  onBlind?: () => void;
  /** Efeito colateral ao levar o golpe bloqueado no NPC. */
  onBlocked?: () => void;
  /** Efeito colateral do golpe que voltou contra o jogador (confusão). */
  onSelfDamage?: () => void;

  guard: "blind" | "confused" | "ok";
  onBeforeNpcHitRef?: RefObject<OnBeforeNpcHit>;

  setNpcHP: (updater: (hp: number) => number) => void;
  setPlayerHP: (updater: (hp: number) => number) => void;
  /**
   * Vampirismo para o dano parcial que passa pelo bloqueio. O golpe básico e o
   * special pagam a mesma passagem, então a origem entra como config.
   */
  vampirism: VampirismStats;
  playerMaxHp: number;
  /** `basic` só paga o vampirismo normal; `other`, só o universal. */
  source: VampirismSource;
  registerHitRef: RefObject<(damage: number) => void>;
  onDamageDealtRef?: RefObject<(amount: number) => void>;
  spawnDamageRef: RefObject<
    (value: number, x: number, y: number, type: DamageType) => void
  >;
  npcX: number;
  npcY: number;
  playerX: number;
  playerY: number;
};

export type HitPreludeResult =
  /** O golpe segue: dano garantido, pode ser aplicado. */
  | { kind: "proceed" }
  /** Saiu, mas o NPC registrou o acerto parcial. */
  | { kind: "handled" }
  /** Saiu sem causar dano: congelado, fora de alcance ou cego. */
  | { kind: "abort" };

/**
 * Passagem comum de todo golpe do jogador antes de causar dano: cegueira,
 * bloqueio do NPC e confusão.
 *
 * Ataque básico e special respondem exatamente nesta ordem e com os mesmos
 * efeitos; o que muda é o cálculo do dano, o cooldown e os efeitos colaterais
 * (o special zera a delícia, o básico notifica o cut-in do marshadow). Antes
 * cada um reescrevia os três desfechos, e a diferença entre eles era de
 * leitura, não de regra.
 */
export function runHitPrelude(config: HitPreludeConfig): HitPreludeResult {
  const {
    guard,
    onBeforeNpcHitRef,
    setNpcHP,
    setPlayerHP,
    registerHitRef,
    onDamageDealtRef,
    spawnDamageRef,
    npcX,
    npcY,
    playerX,
    playerY,
    cooldownMs,
    playerCooldown,
    calculateDamage,
    npcElements,
    onBlind,
    onBlocked,
    onSelfDamage,
    vampirism,
    playerMaxHp,
    source,
  } = config;

  if (guard === "blind") {
    spawnDamageRef.current?.(0, npcX, npcY, "miss");
    onBlind?.();
    resetCooldownRef(cooldownMs, playerCooldown);
    return { kind: "abort" };
  }

  const blockResult = onBeforeNpcHitRef?.current?.(() => {
    return calculateDamage(npcElements).damage;
  });

  if (blockResult?.blocked) {
    resetCooldownRef(cooldownMs, playerCooldown);
    if (blockResult.remainingDamage > 0) {
      setNpcHP((hp) => Math.max(0, hp - blockResult.remainingDamage));
      registerHitRef.current?.(blockResult.remainingDamage);
      onDamageDealtRef?.current?.(blockResult.remainingDamage);
      spawnDamageRef.current?.(blockResult.remainingDamage, npcX, npcY, "npc");
      // O que sobra do bloqueio é dano causado de verdade, então paga
      // vampirismo; o que volta por confusão é dano *recebido* e não conta.
      applyVampirism({
        damage: blockResult.remainingDamage,
        source,
        vampirism,
        playerMaxHp,
        setPlayerHP,
      });
      onBlocked?.();
    }
    return { kind: "handled" };
  }

  if (guard === "confused") {
    // O golpe volta contra o jogador: mesmo cálculo, mas sem elemento (array vazio).
    const { damage: selfDmg } = calculateDamage([]);
    if (selfDmg > 0) {
      setPlayerHP((hp) => Math.max(0, hp - selfDmg));
      spawnDamageRef.current?.(selfDmg, playerX, playerY, "confuse");
    }
    onSelfDamage?.();
    resetCooldownRef(cooldownMs, playerCooldown);
    return { kind: "handled" };
  }

  return { kind: "proceed" };
}
