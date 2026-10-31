/** Lado do shield de bloqueio do babidi: espelha o lado de quem ataca. */
export type BabidiShieldSide = "left" | "right";

/**
 * Shield de bloqueio por lado. O valor é um nonce: `0` = inativo, `> 0` = ativo.
 * Cada golpe bloqueado incrementa o nonce do lado para remontar o sprite e
 * reexecutar a animação de surgimento (o "blink").
 */
export type BabidiShieldSides = Record<BabidiShieldSide, number>;

/** Alvo do projétil de energia (NPC principal ou summon inimigo vivo). */
export type BabidiTarget = {
  id: string;
  x: number;
  y: number;
};

/** Projétil de energia do ataque básico do babidi em voo. */
export type BabidiEnergyProjectile = {
  id: string;
  x: number;
  y: number;
  /**
   * Componente horizontal do voo: nasce `±1` (tiro reto) e vira `0` quando o
   * projétil sai de um portal vertical. O sprite espelha quando é negativo.
   */
  dirX: number;
  /**
   * Componente vertical: `0` no disparo normal e `±1` depois de atravessar um
   * portal — o terrestre cospe para cima (`-1`), o aéreo para baixo (`1`).
   */
  dirY: number;
};

/**
 * "Energia Dimensional" — portais do babidi.
 *
 * Dois portais formam um par: a entidade que entra num sai no outro (player,
 * NPC, summons, aliados e pet). A energia (25% do máximo) é paga ao posicionar
 * e devolvida ao desfazer; com dois no mapa o toque no botão vira o undo.
 */

/** Forma do portal: deitado no chão, em pé (frontal) ou suspenso (aéreo). */
export type BabidiPortalKind = "ground" | "default" | "air";

/** Fase do portal: voando da mão até o destino, ou já fixo no mapa. */
export type BabidiPortalPhase = "flying" | "placed";

/**
 * Warp de projétil entre os portais. Recebe a posição do projétil e devolve o
 * destino (o portal par) quando ele cruza a zona de travessia — ou `null`
 * quando não há travessia (menos de dois portais, já desarmado, fora da zona).
 * O `kind` do destino é o que decide a direção de saída (ver
 * `getPortalExitDirection`); o chamador aplica ao próprio movimento. Injetado
 * nos loops de projétil (NPC e energia do babidi) pelo hook de portais.
 */
export type BabidiPortalWarpFn = (
  id: string,
  x: number,
  y: number,
) => { x: number; y: number; kind: BabidiPortalKind } | null;

/**
 * Portal posicionado (ou em voo). O `y` é a **âncora** (o chão em que a
 * entidade entra), não o centro da arte: o render sobe o sprite a partir dele,
 * e o teleporte/hitbox usam a mesma coordenada.
 */
export type BabidiPortal = {
  id: string;
  kind: BabidiPortalKind;
  phase: BabidiPortalPhase;
  /** Posição atual — interpolada enquanto o portal voa até o destino. */
  x: number;
  y: number;
  /** Origem (mão do babidi) e destino do voo, para a interpolação. */
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  /** Timestamp em que o voo começou. */
  startTime: number;
  /** Energia paga por este portal — devolvida inteira ao desfazê-lo. */
  cost: number;
};

/**
 * Travessia visual de uma entidade por um portal terrestre.
 *
 * Enquanto a entidade afunda (os pés passam abaixo da linha do portal), a parte
 * que já passou some do lado de origem e reaparece saindo do portal par — assim
 * ela "entra" num portal e "sai" no outro em vez de simplesmente sumir. Tudo é
 * derivado da própria posição (o hook já a atualiza durante a queda), então o
 * render reconstrói o efeito sem estado extra.
 */
export type BabidiPortalCross = {
  /** Quanto os pés já afundaram abaixo da linha do portal, em unidades de arena. */
  depth: number;
  /** Portal par: onde a parte "de dentro" reaparece. */
  destX: number;
  destY: number;
};

/** Fantasma do portal durante o posicionamento pelo joystick. */
export type BabidiPortalGhost = {
  kind: BabidiPortalKind;
  x: number;
  y: number;
};

/** Foco de câmera enquanto um portal voa até o destino (`null` = sem foco). */
export type BabidiPortalFocus = { x: number; y: number } | null;

/** Projétil missile do ataque básico do babidi no modo withMissile. */
export type BabidiMissileProjectile = {
  id: string;
  x: number;
  y: number;
  /** Posição de surgimento do portal (fixa). */
  spawnX: number;
  spawnY: number;
  /** Fase: portal de surgimento, voo teleguiado, ou explosão. */
  phase: "portal" | "flying" | "exploding";
  /** Ângulo (graus) da direção de voo atual, para rotação da imagem. */
  angle: number;
  /** Ponto da imagem do alvo a atingir: pés, centro ou topo (aleatório). */
  aim: "feet" | "center" | "top";
  /** Tempo (ms) decorrido desde o spawn (para a animação do portal). */
  age: number;
  /** Tempo (ms) restante na fase de explosão. */
  explosionRemaining: number;
  /** Alvo atual (id do NPC principal ou summon). */
  targetId: string | null;
  /** Direção horizontal atual do voo: +1 direita (padrão), -1 esquerda (flip). */
  dirX: number;
};
