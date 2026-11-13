/**
 * `wall` é sólido (pedra, caixote): barra o passo dos dois lados e dá para
 * subir no topo pulando. `platform` é vazada: atravessa andando e pulando de
 * baixo, só segura quem pousa vindo de cima.
 */
export type BattleObstacleType = "wall" | "platform";

export type BattleObstacle = {
  x: number;
  y: number;
  width: number;
  height: number;
  type: BattleObstacleType;
  /**
   * Nome do arquivo em `public/assets/map/` (resolvido por `mapAssetPath`).
   * Opcional: sem sprite, ou com o arquivo ainda ausente, o obstáculo cai na
   * cor sólida de `TILE_COLORS` — a colisão nunca depende da arte existir.
   */
  sprite?: string;
};

export type BattleMapConfig = {
  obstacles: BattleObstacle[];
};
