
import { PLAYER_SPRITE_DIVISOR } from "@/data/grid";
import type {
    LucauaPortal,
    LucauaPortalKind
} from "@/utils/types/character/lucaua/lucaua";
import type { BattleObstacle } from "@/utils/types/maps/battle";
import { LucauaPortalConstants } from "@/data/characters/lucaua";
import { getGroundAtX } from "@/gameRules/battle/obstacles";

export const NO_OBSTACLES: BattleObstacle[] = []

export function bodyHeight( playerSize: number): number {
    return playerSize / PLAYER_SPRITE_DIVISOR;
}

/**
 * `y` da âncora do portal no ponto `x`.
 *
 * O chão é sondado pela posição do player (é quem lança e está de pé): o
 * `getGroundAtX` procura a superfície que contém os pés, então usar um `y`
 * arbitrário devolveria o piso padrão em vez da plataforma certa.
 */
export function resolvePortalY(
    kind: LucauaPortalKind,
    x: number,
    freeY: number,
    playerGroundY: number,
    obstacles: BattleObstacle[] = NO_OBSTACLES,
): number {
    const ground = getGroundAtX(playerGroundY, x, obstacles);
    if (kind === "air") {
    return Math.max(0, ground - LucauaPortalConstants.AIR_HEIGHT);
    }
    if (kind === "ground") return ground;
    // Frontal: flutua livre, mas nunca abaixo do chão ou acima do topo.
    return Math.max(0, Math.min(ground, freeY));
}

export function overlapsPortal(
    x: number,
    feetY: number,
    portal: LucauaPortal,
): boolean {
    if (Math.abs(x - portal.x) > LucauaPortalConstants.TRIGGER_HALF_X) {
    return false;
    }
    if (portal.kind === "ground") {
        // O portal deitado é um buraco no chão: só captura quem está com os pés
        // na linha (andando) ou abaixo dela (caindo). A margem pequena acima dá
        // a saída do pulo — o ápice do pulo simples passa de 128px, muito além
        // dela, então dá para pular por cima sem cair dentro.
        const above = portal.y - LucauaPortalConstants.GROUND_ENTER_MARGIN;
        return (
            feetY >= above &&
            feetY <= portal.y + LucauaPortalConstants.TRIGGER_HALF_Y
        );
    }
    return Math.abs(feetY - portal.y) <= LucauaPortalConstants.TRIGGER_HALF_Y;
}

/**
 * Chão sob a âncora de um portal. O portal terrestre fica **no** chão (a
 * própria âncora); os flutuantes (frontal/aéreo) ficam acima dele, então a
 * sonda desce `AIR_HEIGHT` para o `getGroundAtX` reconhecer a plataforma que
 * contém os pés — sondar a partir do próprio destino cairia no ar.
 */
export function groundUnder(
    dest: LucauaPortal,
    obstacles: BattleObstacle[] = NO_OBSTACLES
): number {
    if (dest.kind === "ground") return dest.y;
    return getGroundAtX(
        dest.y + LucauaPortalConstants.AIR_HEIGHT + 2,
        dest.x,
        obstacles,
    );
}