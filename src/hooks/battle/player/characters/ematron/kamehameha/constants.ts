import type { VampirismStats } from "@/gameRules/battle/vampirism/applyVampirism";
import { getAbilityDamageType } from "@/data/characters/abilities";
import type { DamageArmor } from "@/utils/types/battle/damageKind";
import type { SoundId } from "@/utils/audio/soundId";
import type { NPCBattleState, SummonedNpc } from "@/utils/types/npc/npc";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { type KamehamehaEffect } from "@/gameRules/battle/characters/ematron/kamehameha";

export type KamehamehaProps = {
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  /** PLAYER_SIZE do layout — ancora o feixe na imagem renderizada do personagem. */
  PLAYER_SIZE: number;
  /** Personagem do jogador (stats usadas para o dano base do feixe). */
  char: { stats: { strength: number } };
  playerClass: PlayerClass;
  /** NPC principal (x/y lidos via latestRef; updateNpc aplica o empurrão). */
  npc: {
    x: number;
    y: number;
    updateNpc: (partial: Partial<NPCBattleState>) => void;
  };
  /** Summons inimigos (também sofrem dano e empurrão do Kamehameha). */
  summons: SummonedNpc[];
  setSummons: Dispatch<SetStateAction<SummonedNpc[]>>;
  setNpcHP: Dispatch<SetStateAction<number>>;
  /** Colunas do NPC principal: o Kamehameha é físico e não pode ignorá-las. */
  npcArmor: DamageArmor;
  /** O feixe é habilidade ativa: paga só o vampirismo universal. */
  vampirism: VampirismStats;
  playerMaxHp: number;
  setPlayerHP: Dispatch<SetStateAction<number>>;
  giveSummonRewards: (npcClass: NPCClass) => void;
  spawnDamageNumber: (
    value: number,
    x: number,
    y: number,
    type: DamageType,
  ) => void;
  /** Registra dano causado pelo player (combo/energia amaldiçoada/passivas). */
  registerHitRef: RefObject<(damage: number) => void>;
  freezeActionsUntilRef: RefObject<number>;
  isPausedRef: RefObject<boolean>;
  isMenuOpenRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  /** Chamado quando o press inicia a habilidade. */
  onUsed?: () => void;
};

/** Natureza do feixe pelo registro de habilidades (o GameData e o hook concordam). */
export const KAMEHAMEHA_DAMAGE_KIND = getAbilityDamageType("kamehameha");

/** Chave do NPC principal no acumulador de apresentação (summons usam o id). */
export const MAIN_TARGET_KEY = "main-npc";

export type KamehamehaApi = {
  effect: KamehamehaEffect | null;
  press: () => void;
  usable: boolean;
};