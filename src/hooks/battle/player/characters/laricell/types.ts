import type { Dispatch, RefObject, SetStateAction } from "react";

import type { BattleBarrier, NpcBlind } from "@/utils/types/battle/npcControl";

/**
 * Dependências comuns das habilidades da Laricell. Vêm prontas do
 * `useBattleCombat`: a guarda de uso (`usableRef`) é calculada uma vez no
 * `useLaricellAbilities` e compartilhada, porque a regra "pode usar
 * habilidade agora" é a mesma para as cinco.
 */
export type LaricellAbilityDeps = {
  player: Player;
  npc: { x: number; y: number };
  usableRef: RefObject<boolean>;
  isPausedRef: RefObject<boolean>;
  cooldownReduction: number;
  playSound: (sound: SoundId) => void;
  /** +carga da Expansão de Domínio (regra de toda habilidade ativa). */
  onUsed: () => void;
};

/** Brincos em voo/explodindo: o alvo é fixado no arremesso. */
export type LaricellEarrings = {
  id: number;
  x: number;
  y: number;
  phase: "fuse" | "explosion";
};

/** O que a cena precisa para desenhar as habilidades da Laricell. */
export type LaricellVisual = {
  wall: BattleBarrier | null;
  earrings: LaricellEarrings | null;
  /** Nuvem de fumaça sobre o NPC enquanto ele está cego. */
  smokeActive: boolean;
  vampireActive: boolean;
  /** Mordida em curso (posição do alvo, para o flash). */
  bite: { x: number; y: number } | null;
};

export type LaricellAbilitiesProps = Omit<LaricellAbilityDeps, "usableRef"> & {
  freezeActionsUntilRef: RefObject<number>;
  disabledRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
  barrierRef: RefObject<BattleBarrier | null>;
  npcBlindRef: RefObject<NpcBlind | null>;
  vampireActive: boolean;
  setVampireActive: Dispatch<SetStateAction<boolean>>;
  /** Golpe de área do funil de dano (`useBattleDamage.handleAbilityAreaHit`). */
  areaHit: (
    abilityId: string,
    x: number,
    y: number,
    radius: number,
    multiplier: number,
  ) => void;
};

/** Um botão: estado de cooldown + press. */
export type LaricellAbilityButton = {
  press: () => void;
  usable: boolean;
  remaining: number;
};

export type LaricellAbilitiesApi = {
  iceWall: LaricellAbilityButton;
  earrings: LaricellAbilityButton;
  smokeBomb: LaricellAbilityButton;
  vampireForm: LaricellAbilityButton;
  bite: LaricellAbilityButton;
  visual: LaricellVisual;
};
