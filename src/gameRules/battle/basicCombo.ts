import type { CharacterId } from "@/data/characters/list";
import {
  BASIC_COMBO_EXCLUDED_CHARACTERS,
  BASIC_COMBO_STEPS,
  type BasicComboStep,
} from "@/data/battle/basicCombo";

type NextComboStepParams = {
  previousIndex: number;
  lastPressAt: number;
  now: number;
  windowMs: number;
  length: number;
};

/**
 * Regra única de encadeamento de combo por janela de tempo, usada pelo combo
 * próprio do ematron e pelo combo básico genérico: dentro da janela o press
 * avança para o próximo golpe (voltando ao primeiro depois do último); fora
 * dela, a postura reseta para o primeiro golpe.
 */
export function nextComboStepIndex({
  previousIndex,
  lastPressAt,
  now,
  windowMs,
  length,
}: NextComboStepParams): number {
  if (length <= 0) return 0;
  const withinWindow = lastPressAt > 0 && now - lastPressAt <= windowMs;
  return withinWindow ? (previousIndex + 1) % length : 0;
}

/** O personagem usa o combo básico genérico de 3 instâncias (issue #376)? */
export function usesBasicCombo(character: CharacterId): boolean {
  return !BASIC_COMBO_EXCLUDED_CHARACTERS.has(character);
}

/**
 * Lê um passo do combo básico tolerando índice inválido (estado antigo ou
 * corrompido): cai no primeiro golpe em vez de estourar.
 */
export function getBasicComboStep(index: number): BasicComboStep {
  return BASIC_COMBO_STEPS[index] ?? BASIC_COMBO_STEPS[0];
}
