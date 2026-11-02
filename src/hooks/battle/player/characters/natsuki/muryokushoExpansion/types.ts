import type {
  Dispatch,
  RefObject,
  SetStateAction,
} from "react";
import type { BattleManaApi } from "@/contexts/BattleManaContext";

import type { MarshadowBattleForm } from "@/utils/paths/characters/marshadow/types";


export type Props = {
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  /** NPC principal (x/y via latestRef, para o número de dano do dreno). */
  npc: {
    x: number;
    y: number;
  };
  /** Vida atual do NPC principal — se já está zerada, o tick não drena. */
  npcHP: number;
  /** Vida MÁXIMA do NPC principal: o tick é `NATSUKI_DOMAIN_DRAIN_RATIO` dela. */
  npcMaxHp: number;
  setNpcHP: Dispatch<SetStateAction<number>>;
  /** Summons inimigos — todos drenam no mesmo ritmo do NPC principal. */
  summons: SummonedNpc[];
  setSummons: Dispatch<SetStateAction<SummonedNpc[]>>;
  spawnDamageNumber: (
    value: number,
    x: number,
    y: number,
    type: DamageType,
  ) => void;
  freezeActionsUntilRef: RefObject<number>;
  /**
   * Energia amaldiçoada do natsuki: o uso do domínio consome metade do que ele
   * tem no momento (`NATSUKI_DOMAIN_MANA_RATIO`), além das 40 cargas.
   */
  battleManaRef: RefObject<BattleManaApi | null>;
  /** Efeitos de time da batalha (regra `gameRules/battle/time`). */
  timeRef: RefObject<TimeEffect[]>;
  isPausedRef: RefObject<boolean>;
  /**
   * Menu da batalha aberto (pausa dirigida pelo jogador): congela o domínio —
   * timers, lock de ação e congelamento do mundo.
   */
  isMenuOpen: boolean;
  battleEndedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  /** specialIntro: abre o `habilities/domainExpansion/background.svg`. */
  startSpecialIntro: (
    character: string,
    onActivate: () => void,
    ability?: string,
    form?: MarshadowBattleForm,
    onCancel?: () => void,
  ) => boolean;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  /** Carga atual da barra da Expansão (o uso consome tudo: vira 0). */
  charges: number;
  /** Carga máxima da barra — a habilidade só existe cheia. */
  chargesMax: number;
  setDelicia: Dispatch<SetStateAction<number>>;
};

export type NatsukiDomainApi = {
  /** O `expansion.svg` está em cena (intro + dreno + quebra). */
  active: boolean;
  /** Fase de estilhaço: algum inimigo sobreviveu e o vidro quebra e desce. */
  shattering: boolean;
  press: () => void;
  usable: boolean;
};
