import {
  FOUR_HUNDRED_MS,
  ONE_THOUSAND_FIVE_HUNDRED_MS,
  TWO_THOUSAND_MS,
  TWO_THOUSAND_EIGHT_HUNDRED_MS,
} from "@/data/ms";

/**
 * Fases do roteiro do Denis (#301):
 * - `ignite`: abertura — ele incendeia a papelada da diretoria e a arena pega
 *   fogo (o dano por segundo da arena mora em `data/battle/arenaHazards.ts`,
 *   não aqui, porque é do mapa e não de um golpe);
 * - `fight`: pistola de chumbo explosivo a distância + toque que carboniza;
 * - `domain`: ensaio de expansão de domínio que o Sistema cancela.
 */
export type DenisPhase = "ignite" | "fight" | "domain";

export type DenisAI = {
  phase: DenisPhase;
  phaseStartedAt: number;
  /** A expansão só é ensaiada uma vez por batalha — o cancelamento é piada única. */
  domainAttempted: boolean;
  shotState: "idle" | "aim";
  shotStartedAt: number;
  lastShot: number;
};

/** Duração da abertura em que ele ateia fogo nos documentos (decisão para revisar). */
export const DENIS_IGNITE_MS = TWO_THOUSAND_MS;

export const DENIS_MELEE_RANGE = 40;

/**
 * Abaixo desta distância ele prefere o toque que carboniza à pistola, para não
 * atirar à queima-roupa enquanto o jogador já está colado nele.
 */
export const DENIS_SHOT_MIN_RANGE = 100;

/** Intervalo entre disparos da pistola (decisão para revisar). */
export const DENIS_SHOT_COOLDOWN = TWO_THOUSAND_EIGHT_HUNDRED_MS;

/** Mira antes do disparo: é a janela que o jogador tem para ler e desviar. */
export const DENIS_SHOT_WINDUP_MS = FOUR_HUNDRED_MS;

/** Fração de vida em que ele tenta a expansão de domínio (decisão para revisar). */
export const DENIS_DOMAIN_HP_THRESHOLD = 0.5;

/** Quanto tempo ele fica "conjurando" até o Sistema cancelar a expansão. */
export const DENIS_DOMAIN_CAST_MS = ONE_THOUSAND_FIVE_HUNDRED_MS;

/** Fala do Sistema ao cancelar a expansão (texto literal da issue #301). */
export const DENIS_DOMAIN_CANCEL_MESSAGE =
  "Você não ousaria fazer isso já nesse ponto né?";

export function initDenisAi(now: number): DenisAI {
  return {
    phase: "ignite",
    phaseStartedAt: now,
    domainAttempted: false,
    shotState: "idle",
    shotStartedAt: 0,
    lastShot: now,
  };
}
