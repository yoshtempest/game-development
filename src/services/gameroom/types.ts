/**
 * Tipos do tempest-gameroom, espelhando o OpenAPI fornecido.
 *
 * O spec descreve REST e o caminho WebSocket, mas não o protocolo de mensagens
 * do WS. `GameRoomWsMessage` fica intencionalmente aberto para o consumidor
 * tipar o protocolo real quando integrar.
 */

export type GameRoomPlayer = {
  /** Id estável do jogador (o `sub` do JWT quando há conta). */
  player_id: string;
  /** Nome de exibição. */
  name: string;
  /** Lugar na sala, de 0 a `max_players - 1`. */
  slot: number;
  /** `false` enquanto o lugar espera um `resume`. */
  connected: boolean;
};

export type GameRoom = {
  /** Código que os jogadores usam no `join`. */
  code: string;
  /** `lobby` aceita jogadores; `playing` recusa por padrão. */
  state: "lobby" | "playing";
  /** `player_id` do anfitrião. */
  host_id: string | null;
  /** Lugares da sala. */
  max_players: number;
  /** Jogadores sentados, ordenados por slot. */
  players: GameRoomPlayer[];
};

export type GameRoomGame = {
  /** Identificador do jogo na URL. */
  slug: string;
  /** Nome de exibição. */
  name: string;
  /** Lugares por sala. */
  max_players: number;
  /** Versão exigida no `create`/`join`; `null` aceita qualquer uma. */
  protocol_version: string | null;
  /** Se o `create`/`join` exige token de acesso. */
  requires_account: boolean;
  /** Segundos que o lugar de quem caiu espera um `resume`. */
  reconnect_grace_seconds: number;
  /** Endpoint WebSocket das salas deste jogo. */
  websocket_path: string;
  /** Porta TCP crua do jogo; `null` quando só há WebSocket. */
  tcp_port: number | null;
  /** Quantas salas do jogo estão abertas agora. */
  open_rooms: number;
};

export type GameRoomError = {
  /** Mensagem legível; o cliente deve ramificar por `code`, não por `detail`. */
  detail: string;
  /** Identificador estável da falha. */
  code: string;
  /** Contexto estruturado; vazio quando a exceção não anexou nada. */
  details?: Record<string, unknown>;
  /** Campo de entrada culpado, quando houver. */
  field?: string | null;
};

/** Envelope genérico: o protocolo real do WS fica a cargo do consumidor. */
export type GameRoomWsMessage = {
  type: string;
  [key: string]: unknown;
};
