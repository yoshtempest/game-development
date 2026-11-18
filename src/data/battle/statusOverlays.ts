import type { PlayerStatus } from "@/utils/types/battle/status";

/**
 * Imagens que podem sobrepor o sprite do player enquanto um status está ativo.
 *
 * Guarda só o nome do arquivo: a pasta (`public/assets/effects/status/<status>/`)
 * mora em `statusOverlayPath`. Cada aplicação do status sorteia uma das imagens
 * da lista, então adicionar variação visual é só acrescentar um nome aqui e o
 * arquivo correspondente — nenhum componente muda.
 *
 * Lista vazia desliga o overlay daquele status. Arquivo ausente não quebra a
 * tela: o overlay se esconde no erro de carregamento.
 */
export const STATUS_OVERLAYS = {
  bleed: ["1.svg", "2.svg"],
  burn: ["1.svg", "2.svg"],
  poison: ["1.svg", "2.svg"],
  paralyze: ["1.svg", "2.svg"],
  blind: ["1.svg", "2.svg"],
  confuse: ["1.svg", "2.svg"],
  freeze: ["1.svg", "2.svg"],
} as const satisfies Record<PlayerStatus, readonly string[]>;

/**
 * Status que, além do overlay, tingem o próprio sprite do player.
 *
 * O veneno deixa o personagem ~20% mais roxo (issue #42); a cor e a
 * intensidade ficam no CSS module do `BattleSprite`, aqui só o "quem tinge".
 */
export const STATUS_SPRITE_TINTS: ReadonlySet<PlayerStatus> =
  new Set<PlayerStatus>(["poison"]);

/**
 * Escolhe a imagem de overlay de uma aplicação de status.
 *
 * O sorteio é derivado do instante em que o status termina (`until`), que é
 * único por aplicação: assim a imagem fica estável durante todo o status
 * (re-renders a cada frame não trocam a imagem) e muda numa nova aplicação,
 * sem guardar estado nem chamar `Math.random` durante o render.
 *
 * @param status Status ativo.
 * @param until Timestamp (ms) de fim do status.
 * @returns Nome do arquivo escolhido, ou `null` se o status não tem imagens.
 */
export function pickStatusOverlay(
  status: PlayerStatus,
  until: number,
): string | null {
  const files: readonly string[] = STATUS_OVERLAYS[status];
  if (files.length === 0) return null;
  const index = Math.abs(Math.floor(until)) % files.length;
  return files[index] ?? null;
}
