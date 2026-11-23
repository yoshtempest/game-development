import {
  applyVampirism,
  getVampirismPercent,
  type ApplyVampirismParams,
} from "./applyVampirism";

type Params = ApplyVampirismParams & {
  /** Dano mitigado acumulado de chamadas anteriores que ainda não virou cura. */
  pending: number;
};

/**
 * Vampirismo em lote para golpes contínuos (feixes e cortes por tick).
 *
 * `applyVampirism` arredonda a cura de cada chamada. Num golpe que causa uma
 * fração pequena de dano por tick, cada tick sozinho rende menos de 0.5 de
 * cura e `Math.round` devolve 0: com 10% de vampirismo universal, um tick de
 * 0.5 de dano rendia `Math.round(0.05) === 0`, e o feixe inteiro nunca curava
 * (issue #398). Mesmo quando o tick rende algo, arredondar tick a tick perde
 * ou inventa até 0.5 de cura por instância.
 *
 * Aqui o dano do tick soma ao `pending` e só vai ao funil único
 * (`applyVampirism`) quando o lote já rende pelo menos 1 de cura; a parte do
 * lote que o arredondamento não pagou volta como novo `pending`, para o
 * próximo lote. Assim o total curado ao longo do golpe acompanha o dano total
 * causado, sem um segundo cálculo de cura fora do funil.
 *
 * @returns O dano ainda pendente, a ser passado como `pending` no próximo tick
 * (o chamador guarda num ref e zera no início/fim do golpe).
 */
export function accumulateVampirism({ pending, ...params }: Params): number {
  const percent = getVampirismPercent(params.source, params.vampirism);
  if (percent <= 0) return 0;

  const total = pending + Math.max(0, params.damage);
  if ((total * percent) / 100 < 1) return total;

  const healed = applyVampirism({ ...params, damage: total });
  return Math.max(0, total - (healed * 100) / percent);
}
