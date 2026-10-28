import { TWO_THOUSAND_MS } from "@/data/ms";
import type { MarshadowBattleForm } from "@/utils/paths/characters/marshadow/types";

/**
 * Duração de cada frame da animação idle em batalha. É um respirar, não uma
 * corrida de sprites — 400ms por frame mantém o movimento sutil e evita que
 * o olhar do jogador preste atenção no loop em vez da luta.
 */
export const IDLE_FRAME_MS = TWO_THOUSAND_MS;

/**
 * Fallback da sequência: um único frame (o `idle.svg` base). Personagem/fora
 * da tabela anima nada e continua exatamente como antes — o sprite parado.
 */
const DEFAULT_IDLE_FRAMES: readonly string[] = ["idle"];

/** Frames do marshadow no formulário default (`default/idle/idle{,2,3}.svg`). */
const MARSHADOW_IDLE_FRAMES: readonly string[] = ["idle", "idle2", "idle3"];

/**
 * Sequência de frames do idle por personagem. O primeiro nome é o sprite base
 * que `resolveBattleSprite` já devolve (`.../idle/idle.svg`); os demais são
 * variantes na mesma pasta (`idle2.svg`, `idle3.svg`).
 *
 * Só entra aqui quem realmente tem essas variantes no disco — cada entrada
 * a menos é uma animação a menos e um 404 a menos em batalha.
 */
const IDLE_FRAMES_BY_CHARACTER: Partial<
  Record<CharacterId, readonly string[]>
> = {
  marshadow: MARSHADOW_IDLE_FRAMES,
  natsuki: MARSHADOW_IDLE_FRAMES,
};

/**
 * Frames por forma quando a forma tem pasta de sprites própria e NÃO herda a
 * sequência do personagem base. A Forma Vastolord tem só `idle.svg` em
 * `vastolordForm/idle/`, então tentar `idle2.svg` ali geraria 404 a cada
 * ciclo da batalha. Formas sem entrada aqui caem na tabela do personagem.
 */
const IDLE_FRAMES_BY_FORM: Partial<
  Record<MarshadowBattleForm, readonly string[]>
> = {
  vastolordForm: DEFAULT_IDLE_FRAMES,
};

/**
 * Sequência de frames do idle para o personagem (e forma) em batalha.
 * Retorna sempre a mesma referência por entrada — o hook consome o array como
 * dep de effect, então alocar um array novo por render recriaria o intervalo.
 */
export function getIdleFrames(
  character: CharacterId,
  form?: MarshadowBattleForm,
): readonly string[] {
  if (form) {
    return (
      IDLE_FRAMES_BY_FORM[form] ??
      IDLE_FRAMES_BY_CHARACTER[character] ??
      DEFAULT_IDLE_FRAMES
    );
  }
  return IDLE_FRAMES_BY_CHARACTER[character] ?? DEFAULT_IDLE_FRAMES;
}
