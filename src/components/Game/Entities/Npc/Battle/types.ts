import type { CutInEnemieOverlay } from "@/utils/types/battle/cutInEnemie";
import type { BattleOutroResult } from "@/utils/types/battle/outro";

export type Props = {
  x: number;
  y: number;
  TILE_SIZE: number;
  npcType: string;
  state:
    | "idle"
    | "walk"
    | "default"
    | "hit"
    | "jumping"
    | "attack"
    | "pitch"
    | "inAir"
    | "airAttack"
    | "preAttack"
    | "preJump"
    | "inJump"
    | "jumpAttack"
    | "block"
    | "meleeAttack"
    | "rangedAttack"
    | "get"
    | "throw"
    | "startDash"
    | "inDash"
    | "startThrow"
    | "throwing"
    | "throwed"
    | "startSpin"
    | "inSpin"
    | "finishSpin"
    | "preMove"
    | "run"
    | "slap"
    | "push"
    | "meditating"
    | "flying"
    | "landing"
    | "laser"
    | "debuff"
    | "throwPapers"
    | "charging"
    | "invoking"
    | "dig"
    | "entering"
    | "entered"
    | "fall"
    | "giveMeMyPower"
    | "jump"
    | "falling"
    | "prePunch"
    | "punch"
    | "preKick"
    | "kick"
    | "compress"
    | "combine"
    | "problem"
    | "taBom"
    | "nuke";
  direction: "left" | "right";
  piercings?: { id: number; x: number; y: number }[];
  isExploding?: boolean;
  isHidden?: boolean;
  /** Fade-out/in para o NPC underground (alfas cavando): opacity com transição. */
  isUnderground?: boolean;
  npcPhase?: number;
  isDying?: boolean;
  isAlfa?: boolean;
  /** CutInEnemie do marshadow sobrepondo o NPC (aparece por 1s no ataque). */
  cutInEnemie?: CutInEnemieOverlay | null;
  /** NPC em sangramento: mostra o bloodIcon acima da imagem. */
  npcBleeding?: boolean;
  /**
   * Furo da esfera purple: se a purple matou o NPC, o sprite perde o lado
   * central-direito no ponto do impacto (em vez de só sumir no fade).
   */
  purpleHole?: boolean;
  /**
   * HP atual. Quando cai, o sprite pisca em vermelho (`useHitFlash`).
   * Ausente = sem piscada (pet, aliado e visual remoto não passam HP).
   */
  hp?: number;
  /**
   * Total de knockbacks sofridos. Quando cresce, o sprite vira `pushed.svg`
   * por `NPC_PUSHED_SPRITE_MS` — só para NPCs em `NPC_PUSHED_SPRITES`; sem o
   * arquivo, mantém o sprite do estado atual (nunca imagem quebrada).
   */
  pushCount?: number;
  /**
   * Resultado da batalha do ponto de vista **deste NPC**. Com valor, o sprite
   * troca para `victory.svg`/`defeat.svg` e fica assim até sair da batalha,
   * como o retrato do player faz com `outroExpression`. Sem o arquivo, a
   * cadeia de fallback do `onError` cai no `default.svg`.
   */
  outroResult?: BattleOutroResult | null;
};