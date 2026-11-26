import type { NpcType } from "@/data/npc/npc";
import type { NewPlayerStatus } from "@/utils/types/battle/status";
import { ONE_THOUSAND_MS, SIX_THOUSAND_MS } from "@/data/ms";

/**
 * Grito de um summon: golpe de média distância que, ao acertar, causa o dano
 * normal do summon e aplica um status no player (via `applyStatus`, que passa
 * por `applyPlayerStatus` e pelas resistências equipadas).
 */
export type SummonShout = {
  /** Distância horizontal máxima até o player para o grito acertar. */
  range: number;
  /** Intervalo mínimo entre dois gritos do mesmo summon. */
  cooldownMs: number;
  /** Quanto tempo o summon fica parado na pose do grito (`debuff`). */
  durationMs: number;
  status: NewPlayerStatus;
  /** Fala do grito — referência para o balão/áudio quando o asset existir. */
  line: string;
};

/**
 * Gritos por tipo de summon. Decisão para revisar: alcance 260px e cooldown
 * de 6s para a Netali — curto o bastante para a confusão pesar, longo o
 * bastante para o player conseguir agir entre um grito e outro.
 */
export const SUMMON_SHOUTS: Partial<Record<NpcType, SummonShout>> = {
  netali: {
    range: 260,
    cooldownMs: SIX_THOUSAND_MS,
    durationMs: ONE_THOUSAND_MS,
    status: "confuse",
    line: "VERB TO BE",
  },
};
