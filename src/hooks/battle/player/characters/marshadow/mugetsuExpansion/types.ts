import type { VampirismStats } from "@/gameRules/battle/vampirism/applyVampirism";
import type { Dispatch, RefObject, SetStateAction } from "react";

import type { NPCBattleState } from "@/utils/types/npc/npc";
import type {
  MugetsuBlink,
  MugetsuDisintegrationTarget,
  MugetsuSweep,
} from "@/utils/types/battle/mugetsu";

export type Props = {
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  /** NPC principal (x/y via latestRef; updateNpc aplica a pose de hit). */
  npc: {
    x: number;
    y: number;
    state: NPCBattleState["state"];
    updateNpc: (partial: Partial<NPCBattleState>) => void;
  };
  /** Dados do NPC principal para registrar a desintegração no toque. */
  mainNpcType: string;
  mainNpcPhase: number;
  /** O NPC principal é boss? (decide se a fase 2 sobrevive e o vidro quebra). */
  mainNpcIsBoss: boolean;
  isAlfa: boolean;
  /** Summons inimigos — todos os cruzados pela varredura morrem. */
  summons: SummonedNpc[];
  setSummons: Dispatch<SetStateAction<SummonedNpc[]>>;
  /** A varredura é habilidade ativa: paga só o vampirismo universal. */
  vampirism: VampirismStats;
  playerMaxHp: number;
  setPlayerHP: Dispatch<SetStateAction<number>>;
  /** Projéteis inimigos — a varredura desintegra os que a frente alcança. */
  projectiles: Projectile[];
  setProjectiles: Dispatch<SetStateAction<Projectile[]>>;
  setNpcHP: Dispatch<SetStateAction<number>>;
  /** Vida máxima do NPC principal — o dano exibido é 100% dela. */
  npcMaxHp: number;
  giveSummonRewards: (npcClass: NPCClass) => void;
  spawnDamageNumber: (
    value: number,
    x: number,
    y: number,
    type: DamageType,
  ) => void;
  /** Registra dano causado (combo/energia amaldiçoada/passivas). */
  registerHitRef: RefObject<(damage: number) => void>;
  freezeActionsUntilRef: RefObject<number>;
  /** Efeitos de time da batalha (regra `gameRules/battle/time`). */
  timeRef: RefObject<TimeEffect[]>;
  isPausedRef: RefObject<boolean>;
  /**
   * Menu da batalha aberto (pausa dirigida pelo jogador): congela a linha do
   * tempo do domínio — timers, frente da varredura, lock de ação e mundo.
   */
  isMenuOpen: boolean;
  battleEndedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  /** specialIntro: abre o background da habilidade (habilities/domainExpansion/...). */
  startSpecialIntro: (
    character: string,
    onActivate: () => void,
    ability?: string,
  ) => void;
  /** Disparado APENAS quando a varredura chega na outra ponta do mapa. */
  onNpcKilled: () => void;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  /** Carga atual da barra da Expansão (o uso consome tudo: vira 0). */
  charges: number;
  /** Carga máxima da barra — a habilidade só existe cheia. */
  chargesMax: number;
  setDelicia: Dispatch<SetStateAction<number>>;
};

export type DomainExpansionApi = {
  /** Instância do mugetsuEffect varrendo o mapa (null quando inativa). */
  mugetsuSweep: MugetsuSweep | null;
  /** True do início da habilidade até o fim da varredura (troca o background). */
  domainExpansionActive: boolean;
  /** Fase de estilhaço do vidro: um boss de duas fases sobreviveu (fase 2). */
  shattering: boolean;
  /** Fase do blink do teleporte do jogador. */
  mugetsuBlink: MugetsuBlink;
  /** Alvos (NPC principal + summons) sendo desintegrados pela varredura. */
  disintegrating: MugetsuDisintegrationTarget[];
  press: () => void;
  usable: boolean;
};
