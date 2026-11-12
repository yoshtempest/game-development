import { useCallback, useEffect, useRef } from "react";

import { useSummonAI } from "@/hooks/battle/summon/ai/useAi";
import { useAllyAI } from "@/hooks/battle/summon/allyAI/useAllyAI";
import { usePlayerSpecialProjectile } from "@/hooks/battle/player/playerSpecialProjectile/usePlayerSpecialProjectile";
import { useBabidiMissile } from "@/hooks/battle/player/characters/babidi/missile/useMissile";
import { VASTOLORD_KILL_EXTEND_MS } from "@/hooks/battle/player/characters/marshadow/vastolordForm/useVastolordForm";
import { BATTLE_SPAWN } from "@/gameRules/battle/spawnPoints";
import { applyCooldownReduction } from "@/gameRules/battle/cooldownReduction";
import { BabidiFishingNetConstants } from "@/data/characters/babidi";
import { PET_ROOT_DURATION_MS } from "@/data/characters/pets/petSkills";
import { PLAYER_SPRITE_DIVISOR } from "@/data/grid";

import type { BattleEntitiesProps } from "./types";

/**
 * Entidades de batalha (`useBattleEntities`): quem está em cena e o que eles
 * fazem quando não é o jogador — os summons inimigos, os allies, o projétil
 * especial do player e a Fishing Net com os mísseis que saem dela.
 *
 * O controle das entidades enraizadas mora aqui: os refs de raiz vêm do
 * `useBattleCore` (o grab/throw do NPC também os usa), mas quem decide quem
 * fica preso e por quanto tempo é este hook.
 */
export function useBattleEntities({
  battle,
  refs,
  npc,
  player,
  playerClass,
  npcType,
  npcLevel,
  difficulty,
  isAlfa,
  summons,
  setSummons,
  allies,
  setAllies,
  isPausedRef,
  lootActiveRef,
  honoredFleeRef,
  npcRootedUntilRef,
  rootedSummonsUntilRef,
  PLAYER_SIZE,
  timeScaleRef,
  setTimeScale,
  playerProjectileRef,
  onFireRef,
  vastolordActive,
  extendVastolordRef,
  addVastolordLaserChargeRef,
  battleManaRef,
  startAbility,
  onAbilityUsed,
  fishingNet,
  fishingNetRef,
  fishingNetTimerRef,
  fishingNetPushTimerRef,
  fishingNetReadyAtRef,
  setFishingNet,
  setFishingNetRemaining,
}: BattleEntitiesProps) {
  // ── Controle de entidades enraizadas ──────────────────────────────────────
  /** Summons congelados: enquanto o tempo do ref não vence, a IA não os move. */
  const freezeSummonsUntilRef = useRef(0);

  /** Duração da raiz aplicada às entidades enraizadas (NPC e summons). */
  const rootDurationMs = PET_ROOT_DURATION_MS;

  // ── IA dos summons inimigos ──────────────────────────────────────────────
  useSummonAI({
    summons,
    setSummons,
    isPaused: isPausedRef.current || lootActiveRef.current,
    playerX: player.x,
    playerY: player.y,
    playerClass,
    playerCharacter: player.character,
    npcLevel,
    difficulty,
    damagePlayer: battle.damagePlayer,
    spawnDamageRef: refs.spawnDamageRef,
    timeRef: refs.timeRef,
    freezeUntilRef: freezeSummonsUntilRef,
    rootedSummonsUntilRef,
    honoredFleeRef,
    onSummonKilled: () => {
      if (vastolordActive) {
        extendVastolordRef.current(VASTOLORD_KILL_EXTEND_MS);
        addVastolordLaserChargeRef.current();
      }
    },
  });

  // ── IA dos allies ────────────────────────────────────────────────────────
  useAllyAI({
    allies,
    setAllies,
    enemySummons: summons,
    setEnemySummons: setSummons,
    isPaused: isPausedRef.current,
    isEnding: battle.isEnding.current,
    enemyNpc: { x: npc.x, y: npc.y, npcType },
    npcHp: battle.npcHP,
    npcArmor: battle.npcArmor,
    setNpcHP: battle.setNpcHP,
    npcLevel,
    difficulty,
    spawnDamageRef: refs.spawnDamageRef,
    timeRef: refs.timeRef,
  });

  // ── Projétil especial (esfera do natsuki) ────────────────────────────────
  const { playerProjectile } = usePlayerSpecialProjectile({
    player,
    PLAYER_SIZE,
    onFire: () => onFireRef.current(),
    timeScaleRef,
    setTimeScale,
  });

  useEffect(() => {
    playerProjectileRef.current = playerProjectile;
  }, [playerProjectile, playerProjectileRef]);

  // ── Fishing Net e seus mísseis ───────────────────────────────────────────
  // Mísseis automáticos enquanto o NPC está preso pela fishingNet: surgem ao
  // redor do NPC (de dentro de um portal) e voam em sua direção, causando 20%
  // do dano mágico do personagem, independentemente do uso manual do míssil.
  const fishingNetMissile = useBabidiMissile({
    PLAYER_SIZE,
    npcType,
    npcPhase: battle.npcPhase ?? 1,
    isAlfa,
    timeRef: refs.timeRef,
    npc: { x: npc.x, y: npc.y },
    summons,
    onProjectileHit: (target) => {
      if (target.id === "main") {
        battle.playerHit(0.2, true, true, "magical");
      }
    },
    maxMissiles: 10,
    randomSpawn: true,
  });

  const fishingNetMissileRef = useRef(fishingNetMissile);
  fishingNetMissileRef.current = fishingNetMissile;

  useEffect(() => {
    if (!fishingNet) return;
    const interval = setInterval(() => {
      const spriteHeight = PLAYER_SIZE / PLAYER_SPRITE_DIVISOR;
      fishingNetMissileRef.current.fire({
        x: npc.x,
        y: npc.y + spriteHeight * 1.6,
      });
    }, 100);
    return () => clearInterval(interval);
  }, [fishingNet, npc.x, npc.y, PLAYER_SIZE]);

  const fishingNetPress = useCallback(() => {
    if (Date.now() < fishingNetReadyAtRef.current) return;
    const mana = battleManaRef.current;
    const spend = mana
      ? Math.ceil(mana.playerMaxMana * BabidiFishingNetConstants.COST_RATIO)
      : 0;
    if (mana && spend > 0 && !mana.consumeMana(spend)) return;
    if (!battle.playerMaxHp) return;
    startAbility();
    onAbilityUsed();
    if (fishingNetTimerRef.current) {
      clearTimeout(fishingNetTimerRef.current);
      fishingNetTimerRef.current = null;
    }
    if (fishingNetPushTimerRef.current) {
      clearInterval(fishingNetPushTimerRef.current);
      fishingNetPushTimerRef.current = null;
    }

    // A rede cai sobre o alvo. Se o alvo estiver acima do chão (em y), a rede
    // empurra o inimigo até o chão de y da batalha enquanto cai.
    const groundY = BATTLE_SPAWN.npc.y;
    const enemyAboveGround = npc.y < groundY;
    const finalEnemyY = enemyAboveGround ? groundY : npc.y;
    const net = {
      x: npc.x,
      y: finalEnemyY - 60,
    };
    setFishingNet(net);
    fishingNetRef.current = net;

    if (enemyAboveGround) {
      const startY = npc.y;
      const fallMs = BabidiFishingNetConstants.FALL_MS;
      const pushStart = Date.now();
      fishingNetPushTimerRef.current = setInterval(() => {
        const t = Math.min(1, (Date.now() - pushStart) / fallMs);
        const y = startY + (groundY - startY) * t;
        npc.updateNpc({ y });
        if (t >= 1) {
          if (fishingNetPushTimerRef.current) {
            clearInterval(fishingNetPushTimerRef.current);
            fishingNetPushTimerRef.current = null;
          }
        }
      }, 16);
    }

    const rootMs = BabidiFishingNetConstants.ROOT_MS;
    npcRootedUntilRef.current = Date.now() + rootMs;
    const cooldownMs = applyCooldownReduction(
      BabidiFishingNetConstants.COOLDOWN_MS,
      battle.char.stats.cooldownReduction,
    );
    fishingNetReadyAtRef.current = Date.now() + cooldownMs;
    setFishingNetRemaining(cooldownMs / 1000);
    fishingNetTimerRef.current = setTimeout(() => {
      setFishingNet(null);
      fishingNetRef.current = null;
      npcRootedUntilRef.current = 0;
      fishingNetTimerRef.current = null;
    }, rootMs);
  }, [
    battle.playerMaxHp,
    battle.char.stats.cooldownReduction,
    battleManaRef,
    npc,
    npcRootedUntilRef,
    startAbility,
    onAbilityUsed,
    fishingNetRef,
    fishingNetTimerRef,
    fishingNetPushTimerRef,
    fishingNetReadyAtRef,
    setFishingNet,
    setFishingNetRemaining,
  ]);

  return {
    playerProjectile,
    fishingNetPress,
    /** Mísseis que saem da Fishing Net (a cena os renderiza junto do NPC). */
    fishingNetMissiles: fishingNetMissile.missiles,
    rootDurationMs,
  };
}
