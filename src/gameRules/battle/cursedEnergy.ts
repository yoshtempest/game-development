/**
 * Regras da energia amaldiçoada do Riquelme.
 *
 * A energia amaldiçoada substitui a mana: normalmente não regenera com o time,
 * não tem poções e é carregada ao causar dano em inimigos. A conversão em vida
 * é feita pelo botão extra da passiva. Única exceção à regra de regeneração: a
 * passiva O Abençoado recupera 10/s a partir do início da sequência honored-one
 * pelo resto da batalha.
 */
export const CURSED_ENERGY_DAMAGE_RATIO = 5;
export const CURSED_ENERGY_HEAL_RATIO = 5;

/** Custo do blink (passiva O Abençoado) em energia amaldiçoada. */
export const BLINK_ENERGY_COST = 10;

/** Distância do teleporte curto do blink, em px. */
export const BLINK_DISTANCE = 200;

/** Atraso antes do blink teleportar: a imagem vira silhueta preta no local de origem. */
export const BLINK_UNTIL_TELEPORT_MS = 50;

/** Duração da transição silhueta preta → branca no destino do blink, em ms. */
export const BLINK_SILHOUETTE_FADE_MS = 100;

/** Duração da silhueta preta deixada no local de origem do blink, em ms. */
export const BLINK_AFTERIMAGE_MS = 300;

/** Custo do Punho Divergente em energia amaldiçoada. */
export const DIVERGENT_FIST_COST = 25;

/** Atraso da segunda instância de dano do Punho Divergente, em ms. O inimigo é empurrado e recebe o dano quando o sprite `four.svg` da animação é atingido. */
export const DIVERGENT_FIST_DELAY_MS = 200;

/** Número de sprites da animação do Punho Divergente (one.svg → eight.svg). */
export const DIVERGENT_FIST_SPRITE_COUNT = 8;

/** Duração de exibição de cada sprite da animação do Punho Divergente, em ms. */
export const DIVERGENT_FIST_FRAME_MS = 50;

/**
 * Duração da sequência "O Mais Honrado" (passiva O Abençoado), em ms. Casa com
 * a duração real de honored-one.mp3 (~7.345s). É usada como janela de hitstop
 * (congela projéteis e ações) enquanto a coreografia roda; o fim efetivo da
 * sequência acontece quando o riquelme aterrissa em `idleCrounched`.
 */
export const HONORED_ONE_DURATION_MS = 7345;
/** Id do efeito de time de O Mais Honrado (regra `gameRules/battle/time`). */
export const HONORED_ONE_TIME_ID = "riquelme:honoredOne";

/**
 * Multiplicadores do efeito de time de O Mais Honrado: o mundo continua se
 * movendo, mas a 1/4 da velocidade, e os ataques saem de crase 3x mais longos.
 * É o "slow-motion" que substitui o antigo congelamento duro da sequência.
 */
export const HONORED_ONE_TIME_SPEED = 0.25;
export const HONORED_ONE_TIME_COOLDOWN = 3;

/** Duração da fase de subida/rotação do "O Mais Honrado", em ms. */
export const HONORED_ONE_RISE_MS = 5_000;

/** Altura que o riquelme sobe no ar durante a fase de subida, em px. */
export const HONORED_ONE_RISE_Y = 400;

/** Distância mínima em x que os inimigos devem manter do jogador durante a sequência. */
export const HONORED_ONE_FLEE_DISTANCE = 300;

/** Passo máximo por tick (20ms) do recuo dos inimigos durante a sequência. */
export const HONORED_ONE_FLEE_STEP = 16;

/**
 * Recuperação passiva de energia amaldiçoada por segundo após o início da
 * sequência "O Mais Honrado" (válida pelo resto da batalha).
 */
export const HONORED_ONE_REGEN_PER_SECOND = 1;

export function cursedEnergyFromDamage(damage: number): number {
  return Math.floor(damage / CURSED_ENERGY_DAMAGE_RATIO);
}

export function cursedEnergyHealAmount(energy: number): number {
  return Math.floor(energy / CURSED_ENERGY_HEAL_RATIO);
}

/**
 * Custo de arremessar a redSphere, em % da energia amaldiçoada MÁXIMA. O custo
 * é por uso (no cast), separado do dreno contínuo da blueSphere.
 */
export const RED_SPHERE_ENERGY_PERCENT = 10;

/**
 * Custo de arremessar a purpleSphere, em % da energia MÁXIMA. A purple é a
 * fusão da blue com a red, então carrega os dois custos por uso num só.
 */
export const PURPLE_SPHERE_ENERGY_PERCENT = 25;

/**
 * Custo em energia amaldiçoada de arremessar uma esfera, como % da energia
 * MÁXIMA do personagem. Percentual inteiro (10/25) em vez de fração para não
 * sofrer com o erro de ponto flutuante de `0.1 * 100` na UI. A blue não entra:
 * o custo dela é o dreno contínuo enquanto a esfera está em campo
 * (`BLUE_SPHERE_DRAIN_COST`, em `data/characters/riquelme/riquelme`).
 */
export function sphereEnergyCost(
  variant: "red" | "purple",
  maxEnergy: number,
): number {
  const percent =
    variant === "purple"
      ? PURPLE_SPHERE_ENERGY_PERCENT
      : RED_SPHERE_ENERGY_PERCENT;
  return Math.floor((maxEnergy * percent) / 100);
}
