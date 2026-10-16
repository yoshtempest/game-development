import type { Dispatch, RefObject, SetStateAction } from "react";

import type { CharactersProgress } from "@/data/characters/defaultProgress";
import type { useBattleRefs } from "@/hooks/battle/utilities/useRefs";
import type { useBattleSystem } from "@/hooks/battle/main/useSystem";
import type { SummonedNpc } from "@/utils/types/npc/npc";
import type {
  RiquelmeSphere,
  RiquelmeSphereVariant,
} from "@/utils/types/character/riquelme";

/** NPC principal visto pelas esferas: atração e empurrão só mexem no eixo x. */
export type SphereNpc = {
  x: number;
  y: number;
  updateNpc: (partial: { x: number }) => void;
};

/**
 * Contexto de combate que as três esferas compartilham: é o que o `playerHit` e
 * o `damageSummon` precisam para aplicar dano no NPC principal e nos summons.
 */
export type SphereBattle = {
  battle: ReturnType<typeof useBattleSystem>;
  npc: SphereNpc;
  summons: SummonedNpc[];
  setSummons: Dispatch<SetStateAction<SummonedNpc[]>>;
  player: Player;
  playerClass: PlayerClass;
  progress: CharactersProgress;
  giveSummonRewards: (npcClass: NPCClass) => void;
  specialDamageRatio: number;
  refs: ReturnType<typeof useBattleRefs>;
};

/**
 * Núcleo do ciclo da esfera: estado/fases comuns às três variantes, o
 * congelamento do mundo e o encerramento. É o contrato entre `useSphereCore` e
 * os hooks de cada esfera (`useBlueSphere`/`useRedSphere`/`usePurpleSphere`).
 */
export type SphereCore = {
  /** Frame atual da esfera (o que a cena desenha). */
  sphere: RiquelmeSphere | null;
  sphereRef: RefObject<RiquelmeSphere | null>;
  /** Marca de tempo do início da fase atual. */
  phaseStartRef: RefObject<number>;
  /** Origem/destino do trecho atual (Setup, voo da red e da purple). */
  fromRef: RefObject<{ x: number; y: number }>;
  targetRef: RefObject<{ x: number; y: number }>;
  /** Um cast está em curso (a esfera existe, mesmo fora de campo). */
  activeRef: RefObject<boolean>;
  /** O recurso/pausa/lock permitem INICIAR um cast novo. */
  canUseRef: RefObject<boolean>;
  /** A ação em curso deve ser cancelada (pausa, morte, fim de batalha). */
  shouldCancelRef: RefObject<() => boolean>;
  freezeActionsUntilRef: RefObject<number>;
  /** Publica um frame novo da esfera (ref + state juntos). */
  publish: (next: RiquelmeSphere) => void;
  setPlayerState: (state: PlayerState) => void;
  resetPlayerIfSphere: () => void;
  /** Congela o mundo pelo tempo do Setup. */
  freezeWorld: (ms: number) => void;
  releaseWorldFreeze: () => void;
  /** Setup compartilhado (`spawning` → `moving`): `true` quando ele acaba. */
  tickSetup: (s: RiquelmeSphere) => boolean;
  /** Fade da dissipação (escala→0 + opacity→0). */
  tickDismiss: (s: RiquelmeSphere) => void;
  /** Inicia um cast: guards, intro (`one/two/three`) e frame inicial. */
  startCast: (variant: RiquelmeSphereVariant) => void;
  /** Encerra o ciclo: libera time/player, zera a esfera e arma o cooldown. */
  finish: () => void;
  /** Começa o fim: libera o player e entra no fade de dissipação. */
  startDismiss: () => void;
};
