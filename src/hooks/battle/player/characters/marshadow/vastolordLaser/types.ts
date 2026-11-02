import type { MarshadowBattleForm } from "@/utils/paths";
import type {
  Dispatch,
  RefObject,
  SetStateAction,
} from "react";
import type { VampirismStats } from "@/gameRules/battle/vampirism/applyVampirism";
import type { DamageArmor } from "@/utils/types/battle/damageKind";

import type { NPCBattleState } from "@/utils/types/npc/npc";
import type { VastolordLaserBeam } from "@/gameRules/battle/characters/marshadow/vastolordLaser";

export type Props = {
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  /** PLAYER_SIZE do layout — ancora o feixe na imagem renderizada do personagem. */
  PLAYER_SIZE: number;
  /** Forma Vastolord ativa (o botão só aparece/liga dentro dela). */
  vastolordActive: boolean;
  /** Personagem do jogador (stats usadas para o dano base do feixe). */
  char: { stats: { strength: number } };
  playerClass: PlayerClass;
  /** NPC principal (x/y lidos via latestRef; updateNpc aplica o empurrão). */
  npc: {
    x: number;
    y: number;
    updateNpc: (partial: Partial<NPCBattleState>) => void;
  };
  /** Summons inimigos (também sofrem dano e empurrão do feixe). */
  summons: SummonedNpc[];
  setSummons: Dispatch<SetStateAction<SummonedNpc[]>>;
  setNpcHP: Dispatch<SetStateAction<number>>;
  /** Colunas do NPC principal: o feixe é físico e não pode ignorá-las. */
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
  /** Menu da batalha aberto: pausa o tick do feixe para ele não completar durante a pausa. */
  isMenuOpenRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  /** specialIntro: abre o background da habilidade (vastolordForm/habilities/laser/...). */
  startSpecialIntro: (
    character: string,
    onActivate: () => void,
    ability?: string,
    form?: MarshadowBattleForm,
  ) => boolean;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  /** Chamado quando o press arma a habilidade (carga da Expansão de Domínio). */
  onUsed?: () => void;
};

export type VastolordLaserApi = {
  beam: VastolordLaserBeam | null;
  press: () => void;
  usable: boolean;
  /** Stacks de Laser disponíveis na Forma Vastolord (cada kill adiciona +1). */
  stacks: number;
  /** +1 stack ao derrotar um inimigo (incluindo minions) na forma. */
  addCharge: () => void;
};
