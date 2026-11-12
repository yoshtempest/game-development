/**
 * Sufixos em ordem decrescente. A ordem importa: o primeiro limite que o
 * valor alcança decide a unidade.
 */
const COMPACT_UNITS = [
  { limit: 1_000_000_000, suffix: "b" },
  { limit: 1_000_000, suffix: "m" },
  { limit: 1_000, suffix: "k" },
] as const;

/** Casas decimais mantidas depois da abreviação (`1150` → `1.15k`). */
const COMPACT_DECIMALS = 2;

/**
 * Abrevia números a partir de 4 dígitos: `1000` → `1k`, `1100` → `1.1k`,
 * `1150` → `1.15k`, `10000` → `10k`, `1000000` → `1m` (issue #414).
 *
 * As casas decimais são **truncadas**, não arredondadas: arredondar faria
 * `999_999` virar `1000k` e mostraria um HP cheio que a entidade não tem.
 * Zeros à direita somem (`1.10k` vira `1.1k`). Abaixo de 1000 o valor sai
 * inteiro (arredondado), sem sufixo — números pequenos continuam idênticos
 * ao que o jogo sempre mostrou.
 *
 * @param value - Número a exibir; negativo mantém o sinal.
 * @returns O texto pronto para a UI.
 */
export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return String(value);

  const sign = value < 0 ? "-" : "";
  const abs = Math.round(Math.abs(value));
  const factor = 10 ** COMPACT_DECIMALS;

  for (const { limit, suffix } of COMPACT_UNITS) {
    if (abs < limit) continue;
    const truncated = Math.floor((abs * factor) / limit) / factor;
    return `${sign}${truncated}${suffix}`;
  }

  return `${sign}${abs}`;
}
