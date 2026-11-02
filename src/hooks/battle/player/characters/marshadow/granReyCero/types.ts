import type { MarshadowBattleForm } from "@/utils/paths";
import type { DamageArmor } from "@/utils/types/battle/damageKind";

import type { NPCBattleState } from "@/utils/types/npc/npc";
import type { VampirismStats } from "@/gameRules/battle/vampirism/applyVampirism";
import type { GranReyCeroEffect } from "@/gameRules/battle/characters/marshadow/granReyCero";
import type {
  Dispatch,
  RefObject,
  SetStateAction,
} from "react";

export type Props = {
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  /** Personagem do jogador (stats usadas para o dano base do corte). */
  char: { stats: { strength: number } };
  playerClass: PlayerClass;
  /** NPC principal (x/y lidos via latestRef; updateNpc aplica o empurrão). */
  npc: {
    x: number;
    y: number;
    updateNpc: (partial: Partial<NPCBattleState>) => void;
  };
  /** Summons inimigos: também são cortados e empurrados. */
  summons: SummonedNpc[];
  setSummons: Dispatch<SetStateAction<SummonedNpc[]>>;
  setNpcHP: Dispatch<SetStateAction<number>>;
  /** Colunas do NPC principal: o corte é físico e não pode ignorá-las. */
  npcArmor: DamageArmor;
  /** O corte é habilidade ativa: paga só o vampirismo universal. */
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
  /** Menu da batalha aberto: pausa o loop da lâmina para ela não completar durante a pausa. */
  isMenuOpenRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  /** specialIntro: abre o background da habilidade (habilities/granReyCero/...). */
  startSpecialIntro: (
    character: string,
    onActivate: () => void,
    ability?: string,
    form?: MarshadowBattleForm,
  ) => boolean;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  /** Chamado quando o press arma a habilidade (carga da Expansão de Domínio). */
  onUsed?: () => void;
  /**
   * Redução de cooldown BRUTA (pontos percentuais), já somada de Técnica,
   * equipamento e título. O hook passa pela curva em `applyCooldownReduction`,
   * então nenhum caminho precisa saber a fórmula — e trocar a curva não toca
   * nenhum destes hooks.
   */
  cooldownReduction: number;
};

export type GranReyCeroApi = {
  effect: GranReyCeroEffect | null;
  press: () => void;
  usable: boolean;
  /** Segundos restantes de recarga (para o rótulo do botão). */
  remaining: number;
};
