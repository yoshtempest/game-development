/**
 * Faixa dos timestamps epoch em ms (2001 a 2286). Nenhum valor de jogo —
 * posição, HP, dano, frame, nonce — chega perto disso, então um número nessa
 * faixa é instante de relógio, venha do campo que vier.
 */
const EPOCH_MS_MIN = 1e12;
const EPOCH_MS_MAX = 1e13;

/**
 * Traduz instantes do relógio de outro aparelho para o relógio local.
 *
 * Estados visuais de habilidade guardam `Date.now()` do aparelho que os criou
 * (`startedAt`, `grabbedUntil`…). Relógios de dois aparelhos divergem em
 * segundos, e a animação do outro lado começaria adiantada ou já terminada.
 * Somar o offset a todo número na faixa epoch evita listar campo a campo — e
 * um efeito novo com timestamp já sai certo.
 *
 * @param value Valor desserializado (JSON) vindo do outro cliente.
 * @param offsetMs `relógio local - relógio remoto`, em ms.
 * @returns Cópia com os instantes deslocados; o resto é preservado.
 */
export function rebaseEpochTimes<T>(value: T, offsetMs: number): T {
  if (offsetMs === 0) return value;
  return rebase(value, offsetMs) as T;
}

function rebase(value: unknown, offsetMs: number): unknown {
  if (typeof value === "number") {
    return value >= EPOCH_MS_MIN && value < EPOCH_MS_MAX
      ? value + offsetMs
      : value;
  }
  if (Array.isArray(value)) return value.map((item) => rebase(item, offsetMs));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      out[key] = rebase(item, offsetMs);
    }
    return out;
  }
  return value;
}
