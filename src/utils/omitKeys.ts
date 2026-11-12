/**
 * Cópia rasa sem as chaves pedidas, com o tipo `Omit` correspondente.
 *
 * Existe para montar payloads "tudo menos X" sem desestruturar em variáveis
 * descartadas (que o lint acusa) e sem listar o que fica — assim um campo
 * novo no objeto de origem entra no payload sem edição aqui.
 *
 * @param source Objeto de origem.
 * @param keys Chaves a remover.
 * @returns Novo objeto sem essas chaves.
 */
export function omitKeys<T extends object, K extends keyof T>(
  source: T,
  keys: readonly K[],
): Omit<T, K> {
  const out = { ...source };
  for (const key of keys) delete out[key];
  return out;
}
