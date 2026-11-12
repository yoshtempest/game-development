/**
 * Armas que o Samuel (`samurion`) tira do grimório de 5 folhas.
 *
 * A troca é uma **sequência fixa**, não sorteio (diferente do Yvel): cada uso
 * do grimório avança para a próxima arma e a última volta para a primeira.
 * A ordem é a da issue #329.
 */
export const SAMUEL_WEAPONS = [
  "dianeHammer",
  "gutsSword",
  "escanorAxe",
] as const;

export type SamuelWeapon = (typeof SAMUEL_WEAPONS)[number];

/** Arma com que o Samuel entra na batalha (primeira da sequência). */
export const DEFAULT_SAMUEL_WEAPON: SamuelWeapon = "dianeHammer";

export const SAMUEL_WEAPON_LABELS: Record<SamuelWeapon, string> = {
  dianeHammer: "Martelo da Diane",
  gutsSword: "Espada do Guts",
  escanorAxe: "Machado do Escanor",
};

/** Duração da invocação do grimório (hitstop + animação da issue #341), em ms. */
export const SAMUEL_GRIMOIRE_SUMMON_MS = 500;

/**
 * Próxima arma da sequência. Indexar com `noUncheckedIndexedAccess` devolve
 * `undefined` no fim da lista, então o fallback é a primeira — o ciclo fecha.
 */
export function nextSamuelWeapon(current: SamuelWeapon): SamuelWeapon {
  const index = SAMUEL_WEAPONS.indexOf(current);
  return SAMUEL_WEAPONS[index + 1] ?? DEFAULT_SAMUEL_WEAPON;
}
