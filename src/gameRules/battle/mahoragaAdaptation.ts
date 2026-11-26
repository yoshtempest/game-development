import type { DamageArmor, DamageKind } from "@/utils/types/battle/damageKind";

/**
 * Colunas que o Mahoraga consegue "aprender". Dano verdadeiro não tem coluna
 * de armadura (ver `getArmorFor`), então não há o que adaptar — e manter isso
 * fora do tipo impede somar armadura numa coluna que não existe.
 */
export type MahoragaAdaptableKind = Exclude<DamageKind, "true">;

/** Golpes recebidos por natureza de dano ao longo da luta. */
export type MahoragaAdaptation = Record<MahoragaAdaptableKind, number>;

/**
 * Quantos golpes da mesma natureza giram a roda uma vez. Decisão para
 * revisar: 6 deixa a primeira adaptação acontecer cedo o bastante para o
 * jogador perceber que precisa variar físico/mágico.
 */
export const MAHORAGA_HITS_PER_ADAPTATION = 6;

/** A roda do Mahoraga tem oito raios: oito giros é o teto da adaptação. */
export const MAHORAGA_MAX_ADAPTATIONS = 8;

/**
 * Armadura somada à coluna adaptada por giro. Com a fórmula
 * `dano * 100 / (100 + armadura)` do `CombatService.applyArmor`, oito giros
 * (+320) cortam o golpe repetido para ~24% do que entraria sem adaptação.
 * Decisão para revisar: valor inicial sem playtest.
 */
export const MAHORAGA_ARMOR_PER_ADAPTATION = 40;

export const EMPTY_MAHORAGA_ADAPTATION: MahoragaAdaptation = {
  physical: 0,
  magical: 0,
};

/**
 * Registra um golpe recebido. Devolve o mesmo objeto quando nada muda (dano
 * verdadeiro) para o `setState` do chamador não re-renderizar à toa.
 */
export function registerMahoragaHit(
  state: MahoragaAdaptation,
  kind: DamageKind,
): MahoragaAdaptation {
  if (kind === "true") return state;
  return { ...state, [kind]: state[kind] + 1 };
}

/** Quantos giros da roda já aconteceram para uma coluna. */
export function getMahoragaAdaptationLevel(hits: number): number {
  return Math.min(
    Math.floor(hits / MAHORAGA_HITS_PER_ADAPTATION),
    MAHORAGA_MAX_ADAPTATIONS,
  );
}

/**
 * Armadura extra que a adaptação concede. A adaptação vira **armadura** (e
 * não multiplicador de dano) para passar pelo funil único
 * `CombatService.applyArmor`: todo caminho de dano que já respeita a armadura
 * do NPC — básico, special, habilidades, summons — passa a respeitar a
 * adaptação sem um quarto funil.
 */
export function getMahoragaAdaptationArmor(
  state: MahoragaAdaptation,
): DamageArmor {
  return {
    physical:
      getMahoragaAdaptationLevel(state.physical) *
      MAHORAGA_ARMOR_PER_ADAPTATION,
    magical:
      getMahoragaAdaptationLevel(state.magical) * MAHORAGA_ARMOR_PER_ADAPTATION,
  };
}
