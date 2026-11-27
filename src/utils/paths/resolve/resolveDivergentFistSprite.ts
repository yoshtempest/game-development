import { DIVERGENT_FIST_SPRITES } from "@/utils/paths/player/constants";
import { playerPathNatsukiHabilities } from "@/utils/paths/characters/natsuki";

/**
 * Caminho do sprite do Punho Divergente para o estado atual.
 *
 * `null` significa "sem arte na pasta da habilidade": o chamador mantém o
 * sprite resolvido em `inFight/`, que é o fallback para estados como `jump`,
 * `falling` e `blocked`. Assim, adicionar um arquivo novo à pasta basta incluir
 * o estado no mapa — a regra de fallback continua a mesma.
 */
export function resolveDivergentFistSprite(state: PlayerState): string | null {
  const sprite = DIVERGENT_FIST_SPRITES[state];
  return sprite ? playerPathNatsukiHabilities(`/divergentFist/${sprite}.svg`) : null;
}
