import type { RefObject } from "react";
import type { useBattleRefs } from "@/hooks/battle/utilities/useRefs";
import type { useBattleStageSetup } from "@/hooks/battle/useBattleStageSetup";
import type { useBattleSystem } from "@/hooks/battle/main/battleSystem/useSystem";
import type { useNpcAI } from "@/hooks/battle/npc/ai/useAi";
import type { BattleManaApi } from "@/contexts/BattleManaContext";

/**
 * Contratos das entidades de batalha (`useBattleEntities`): a IA dos summons
 * inimigos e dos allies, o projétil especial do player, a Fishing Net (com os
 * mísseis que saem dela) e o controle das entidades enraizadas.
 *
 * Os refs de raiz (`npcRootedUntilRef` / `rootedSummonsUntilRef`) nascem no
 * `useBattleCore` porque o grab/throw do NPC também os consome; aqui mora o
 * *controle* (congelamento, IA e a rede que enraíza o NPC).
 */
export type BattleEntitiesProps = {
  battle: ReturnType<typeof useBattleSystem>;
  refs: ReturnType<typeof useBattleRefs>;
  npc: ReturnType<typeof useNpcAI>;
  player: Player;
  playerClass: PlayerClass;
  npcType: string;
  npcLevel: ReturnType<typeof useBattleStageSetup>["npcLevel"];
  difficulty: ReturnType<typeof useBattleStageSetup>["difficulty"];
  isAlfa: boolean;
  summons: ReturnType<typeof useBattleStageSetup>["summons"];
  setSummons: ReturnType<typeof useBattleStageSetup>["setSummons"];
  allies: ReturnType<typeof useBattleStageSetup>["allies"];
  setAllies: ReturnType<typeof useBattleStageSetup>["setAllies"];
  isPausedRef: RefObject<boolean>;
  lootActiveRef: RefObject<boolean>;
  honoredFleeRef: RefObject<boolean>;
  /** Fim da raiz do NPC principal (ms). */
  npcRootedUntilRef: RefObject<number>;
  /** Fim da raiz de cada summon enraizado (id → ms). */
  rootedSummonsUntilRef: RefObject<Record<string, number>>;
  PLAYER_SIZE: number;
  timeScaleRef: RefObject<number>;
  setTimeScale: (scale: number) => void;
  /** Projétil especial em voo: quem o consome é a IA do NPC e a esfera roxa. */
  playerProjectileRef: RefObject<PlayerSpecialProjectile | null>;
  /**
   * Golpe especial disparado quando o projétil funde. Vai por ref porque o
   * projétil nasce antes de `usePlayerBattleActions` existir no combate.
   */
  onFireRef: RefObject<() => void>;
  vastolordActive: boolean;
  extendVastolordRef: RefObject<(ms: number) => void>;
  addVastolordLaserChargeRef: RefObject<() => void>;
  battleManaRef: RefObject<BattleManaApi | null>;
  startAbility: ReturnType<typeof useBattleStageSetup>["startAbility"];
  /** Habilidade ativa usada: concede carga da Expansão de Domínio. */
  onAbilityUsed: (times?: number) => void;
  fishingNet: { x: number; y: number } | null;
  fishingNetRef: RefObject<{ x: number; y: number } | null>;
  fishingNetTimerRef: RefObject<ReturnType<typeof setTimeout> | null>;
  fishingNetPushTimerRef: RefObject<ReturnType<typeof setInterval> | null>;
  fishingNetReadyAtRef: RefObject<number>;
  setFishingNet: (net: { x: number; y: number } | null) => void;
  setFishingNetRemaining: (seconds: number) => void;
};
