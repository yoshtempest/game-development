import type { Dispatch, RefObject, SetStateAction } from "react";

import type {
  AtomicBoomPayload,
  AtomicCut,
  AtomicExplosion,
} from "@/utils/types/battle/atomic";

export type Props = {
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  /** NPC principal (x/y lidos via latestRef para o raio/alvo). */
  npc: { x: number; y: number };
  npcType: string;
  npcMaxHp: number;
  npcHp: number;
  /** Summons inimigos (x/y e vida máxima usados para alvo e raio). */
  summons: SummonedNpc[];
  /** Projéteis do NPC: os destrutíveis no raio também levam a explosão. */
  projectiles: Projectile[];
  /** specialIntro: abre o background da habilidade (habilities/atomic/...). */
  startSpecialIntro: (
    character: string,
    onActivate: () => void,
    ability?: string,
  ) => void;
  /** Aplica o dano em todos os inimigos atingidos (implementado no useBattleCombat). */
  onBoom: (payload: AtomicBoomPayload) => void;
  /** CutInEnemie do marshadow sobre o NPC principal (chance de sangrar). */
  onNpcCutInRef: RefObject<() => void>;
  freezeActionsUntilRef: RefObject<number>;
  isPausedRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
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
  /**
   * Reiryoku atual do Marshadow (`undefined` para quem não tem a barra). A
   * habilidade só fica utilizável com saldo para o custo, e o botão reflete
   * isso pelo mesmo `usable`.
   */
  energy: number | undefined;
  /** Debita o custo em reiryoku; `false` quando não há saldo. */
  spendEnergy: (cost: number) => boolean;
};

export type AtomicApi = {
  /** Halo acima do jogador durante preparing e finalizating. */
  halo: boolean;
  /** Explosão centrada no alvo (startingExplosion.svg → explosion.svg). */
  explosion: AtomicExplosion | null;
  /** CutInEnemie sobre cada inimigo atingido dentro do raio. */
  cuts: AtomicCut[];
  /** Flash no sprite do jogador quando a explosion.svg aparece. */
  flash: boolean;
  press: () => void;
  usable: boolean;
  /** Cooldown restante em segundos (0 quando pronto). */
  remaining: number;
};
