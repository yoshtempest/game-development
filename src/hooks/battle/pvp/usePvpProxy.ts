import { useEffect, useMemo, useRef } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { clampX } from "@/gameRules/movement/clampX";
import { CHARACTERS, type CharacterId } from "@/data/characters/list";
import { getCharacterElementTypes } from "@/data/types/characterElementTypes";
import type { BattleSocketMessage } from "@/hooks/useBattleSocket";
import type { BattleRemotePlayer } from "@/hooks/battle/useBattleNet";
import type { PvpOpponentStats } from "@/hooks/battle/coop/types";
import type { NPCBattleState } from "@/utils/types/npc/npc";
import type { DamageKind } from "@/utils/types/battle/damageKind";

type Subscribe = (
  type: string,
  listener: (msg: BattleSocketMessage) => void,
) => () => void;

/**
 * Pacote de estado do oponente atrasa até ~100 ms. Depois de um golpe local o
 * proxy ignora pacotes com HP **maior** por esta janela, senão a barra pisca de
 * volta para o valor antigo antes do pacote novo chegar.
 */
const LOCAL_HIT_SUPPRESS_MS = 400;

/** HP máximo usado enquanto o primeiro pacote do oponente não chega. */
const FALLBACK_MAX_HP = 100;

function isCharacterId(value: string | undefined): value is CharacterId {
  return value != null && (CHARACTERS as readonly string[]).includes(value);
}

/**
 * Converte o estado do oponente nos atributos defensivos que o funil de dano
 * do atacante usa. Fica fora do hook para o `useMemo` depender só de
 * primitivos — o pacote chega como objeto novo 10 vezes por segundo.
 *
 * Args:
 *     maxHp (number | undefined): HP máximo anunciado pelo oponente.
 *     physical (number): Armadura física dele.
 *     magical (number): Armadura mágica dele.
 *     character (string | undefined): Personagem dele (define a tipagem).
 *
 * Returns:
 *     PvpOpponentStats: Override do NPC para o `useBattleSystem`.
 */
export function buildPvpOpponentStats(
  maxHp: number | undefined,
  physical: number,
  magical: number,
  character: string | undefined,
): PvpOpponentStats {
  return {
    maxHp: maxHp && maxHp > 0 ? maxHp : FALLBACK_MAX_HP,
    armor: { physical, magical },
    elementTypes: isCharacterId(character)
      ? getCharacterElementTypes(character)
      : ["Normalis"],
  };
}

/**
 * Atributos do oponente estabilizados para o `BattleCoop.pvpOpponent`.
 *
 * Args:
 *     remote (BattleRemotePlayer | null): Último pacote do oponente.
 *
 * Returns:
 *     PvpOpponentStats | null: `null` até o primeiro pacote chegar.
 */
export function usePvpOpponentStats(
  remote: BattleRemotePlayer | null,
): PvpOpponentStats | null {
  const known = remote != null;
  const maxHp = remote?.maxHp;
  const physical = remote?.armor?.physical ?? 0;
  const magical = remote?.armor?.magical ?? 0;
  const character = remote?.character;
  return useMemo(
    () =>
      known ? buildPvpOpponentStats(maxHp, physical, magical, character) : null,
    [known, maxHp, physical, magical, character],
  );
}

type ProxyNpc = {
  setNpc: (updater: (previous: NPCBattleState) => NPCBattleState) => void;
};

type ProxyBattle = {
  npcHP: number;
  npcMaxHp: number;
  setNpcHP: (updater: number | ((previous: number) => number)) => void;
  damagePlayer: (
    damage: number,
    damageKind?: DamageKind,
    attackerX?: number,
  ) => void;
};

type Props = {
  enabled: boolean;
  playerId: string;
  opponentId: string | null;
  remote: BattleRemotePlayer | null;
  interp: { x: number; y: number } | null;
  npc: ProxyNpc;
  battle: ProxyBattle;
  playerX: number;
  /** Golpe recebido só conta com o round em andamento. */
  acceptingDamage: boolean;
  send: (msg: BattleSocketMessage) => void;
  subscribe: Subscribe;
};

/**
 * Faz o NPC local se comportar como o oponente do duelo.
 *
 * A batalha inteira foi escrita para "jogador vs NPC": básico, special,
 * habilidades, summons aliados, pet e sangramento já descem em `setNpcHP`. Em
 * vez de duplicar cada caminho com um alvo "jogador", o NPC vira proxy:
 *
 * - posição/direção vêm do pacote do oponente (a IA fica desligada);
 * - o HP espelha o HP **real** dele, que só o cliente dele altera;
 * - toda queda de HP causada aqui vira `pvpDamage` para o dono do HP, que
 *   resolve parry/bloqueio/escudo com os próprios dados. A armadura já foi
 *   aplicada no funil do atacante (com a armadura do oponente, via override),
 *   por isso o dano chega como `"true"`.
 */
export function usePvpProxy({
  enabled,
  playerId,
  opponentId,
  remote,
  interp,
  npc,
  battle,
  playerX,
  acceptingDamage,
  send,
  subscribe,
}: Props) {
  const { setNpc } = npc;
  const { npcHP, npcMaxHp, setNpcHP } = battle;
  const remoteDirection = remote?.direction;

  useEffect(() => {
    if (!enabled || !interp) return;
    setNpc((previous) => {
      const x = clampX(interp.x);
      const y = interp.y;
      const direction =
        remoteDirection === "left" || remoteDirection === "right"
          ? remoteDirection
          : previous.direction;
      if (
        previous.x === x &&
        previous.y === y &&
        previous.direction === direction &&
        previous.state === "idle"
      ) {
        return previous;
      }
      return { ...previous, x, y, direction, state: "idle" };
    });
  }, [enabled, interp, remoteDirection, setNpc]);

  const syncedHpRef = useRef<number | null>(null);
  const prevNpcHpRef = useRef<number | null>(null);
  const prevNpcMaxHpRef = useRef<number | null>(null);
  const suppressUntilRef = useRef(0);
  const npcHpRef = useLatestRef(npcHP);

  useEffect(() => {
    if (!enabled || !remote) return;
    const hp = Math.max(0, remote.hp);
    const current = npcHpRef.current;
    if (hp === current) return;
    if (hp > current && Date.now() < suppressUntilRef.current) return;
    syncedHpRef.current = hp;
    setNpcHP(hp);
  }, [enabled, remote, npcHpRef, setNpcHP]);

  const playerXRef = useLatestRef(playerX);
  useEffect(() => {
    if (!enabled) return;
    const previous = prevNpcHpRef.current;
    const previousMax = prevNpcMaxHpRef.current;
    prevNpcHpRef.current = npcHP;
    prevNpcMaxHpRef.current = npcMaxHp;
    // `useBattleHP` reseta o HP do NPC para o máximo quando o máximo muda
    // (dummy → HP do oponente no primeiro pacote), um render depois da troca.
    // Cair *para* o máximo só acontece nesse reset — golpe nenhum deixa o
    // alvo com HP cheio —, então essa queda não é dano de ninguém.
    if (previousMax != null && previousMax !== npcMaxHp) return;
    if (previous == null || npcHP >= previous) return;
    if (npcHP === npcMaxHp) return;
    if (syncedHpRef.current === npcHP) {
      syncedHpRef.current = null;
      return;
    }
    if (!opponentId) return;
    suppressUntilRef.current = Date.now() + LOCAL_HIT_SUPPRESS_MS;
    send({
      type: "pvpDamage",
      to: opponentId,
      amount: previous - npcHP,
      x: playerXRef.current,
    });
  }, [enabled, npcHP, npcMaxHp, opponentId, send, playerXRef]);

  const battleRef = useLatestRef(battle);
  const acceptingRef = useLatestRef(acceptingDamage);
  useEffect(() => {
    if (!enabled || !opponentId) return;
    return subscribe("pvpDamage", (msg) => {
      if (msg.to !== playerId || msg.from !== opponentId) return;
      if (!acceptingRef.current) return;
      const amount = Number(msg.amount ?? 0);
      if (!Number.isFinite(amount) || amount <= 0) return;
      const attackerX = Number(msg.x);
      battleRef.current.damagePlayer(
        amount,
        "true",
        Number.isFinite(attackerX) ? attackerX : undefined,
      );
    });
  }, [enabled, opponentId, playerId, subscribe, battleRef, acceptingRef]);
}
