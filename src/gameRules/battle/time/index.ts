import { applyHitstop } from "./applyHitStop";
import { applyTime } from "./applyTime";
import { clearTime } from "./clearTime";
import { freezeWorldSpec } from "./freezeWorldSpec";
import { getTime } from "./getTime";
import { isTimeFrozen } from "./isTimeFrozen";
import { scaleCooldown } from "./scaleCooldown";
import { slowWorldSpec } from "./slowWorldSpec";

export {
  applyHitstop,
  applyTime,
  clearTime,
  freezeWorldSpec,
  getTime,
  isTimeFrozen,
  scaleCooldown,
  slowWorldSpec,
};

/**
 * Tipos e constantes da regra de time moram em `./types` — a documentação do
 * modelo está lá. Este arquivo é só a porta de entrada do módulo: re-exporta os
 * tipos/consts e os helpers, sem declarar nada. Os helpers importam `./types`
 * diretamente, nunca `"."`, para não fechar ciclo em runtime.
 */
export {
  ALL_TIME_KINDS,
  HITSTOP_ID,
  NEUTRAL_TIME,
  NPC_TIME_ID,
  PET_TIME_ID,
  PLAYER_SPHERE_TIME_ID,
} from "./types";

export type { BattleTime, TimeKind, TimeSpec } from "./types";
