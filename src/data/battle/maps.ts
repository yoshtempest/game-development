import type {
  BattleMapConfig,
  BattleObstacle,
} from "@/utils/types/maps/battle";

/**
 * Mapas de batalha (issues #311/#63): pedras e plataformas que o player usa
 * para pular sem cair e que a IA do NPC sabe escalar (`stepNpcVertical`).
 *
 * Coordenadas no espaço lógico da arena (`ProjectileConstants.MAP_WIDTH` ×
 * `MAP_HEIGHT` = 1000 × 600), `y` é o topo do obstáculo e o chão fica em
 * `BATTLE_SPAWN.npc.y` (550). Restrições que todo layout respeita:
 *
 * - **Alcance do pulo**: `PLAYER_JUMP_FORCE` -16 com gravidade 1 sobe ~136px,
 *   então topo acessível do chão fica em `y >= 430`; degraus mais altos só a
 *   partir de outra plataforma.
 * - **Spawns livres**: nada entre x 80–170 (player/parceiro) nem 850–950
 *   (NPC/oponente), senão alguém nasce dentro de um sólido.
 * - **Pedra encosta no chão** (`y + height = 550`): sem vão embaixo para o
 *   personagem ficar preso.
 */
const FLOOR_Y = 550;

/** Arte de pedra já existente (a mesma das cenas de exploração). */
const ROCK_SPRITE = "rock.svg";

/** Arte esperada para as plataformas — ainda não existe em `public/`. */
const PLATFORM_SPRITE = "battle/platform.svg";

const PLATFORM_THICKNESS = 16;

/**
 * Pedra sólida apoiada no chão.
 *
 * Args:
 *   x: borda esquerda.
 *   width: largura.
 *   height: altura acima do chão (até ~136 para ser escalável do chão).
 */
function rock(x: number, width: number, height: number): BattleObstacle {
  return {
    x,
    y: FLOOR_Y - height,
    width,
    height,
    type: "wall",
    sprite: ROCK_SPRITE,
  };
}

/**
 * Plataforma vazada suspensa.
 *
 * Args:
 *   x: borda esquerda.
 *   y: topo (onde os pés pousam).
 *   width: largura.
 */
function platform(x: number, y: number, width: number): BattleObstacle {
  return {
    x,
    y,
    width,
    height: PLATFORM_THICKNESS,
    type: "platform",
    sprite: PLATFORM_SPRITE,
  };
}

/** Duas pedras baixas e uma plataforma entre elas — arena de rua/cantina. */
export const ROCKY_FIELD_MAP: BattleMapConfig = {
  obstacles: [rock(320, 60, 40), platform(430, 450, 140), rock(620, 60, 40)],
};

/**
 * Escada em três níveis: duas plataformas laterais e uma central mais alta,
 * que só se alcança a partir das laterais.
 */
export const TWIN_PLATFORMS_MAP: BattleMapConfig = {
  obstacles: [
    platform(220, 460, 160),
    platform(420, 380, 160),
    platform(620, 460, 160),
  ],
};

/** Campo aberto com uma pedra grande no meio para disputar o alto. */
export const CENTER_ROCK_MAP: BattleMapConfig = {
  obstacles: [
    platform(260, 470, 110),
    rock(460, 80, 70),
    platform(630, 470, 110),
  ],
};
