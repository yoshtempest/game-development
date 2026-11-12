import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useOnline } from "@/contexts/OnlineContext";
import { usePlayer } from "@/contexts/PlayerContext";
import {
  useBattleSocket,
  type BattleSocketMessage,
} from "@/hooks/useBattleSocket";
import { ChoiceBox } from "@/components/Game/Interactions/ChoiceBox";
import { playerPath } from "@/utils/paths";
import {
  PVP_BEST_OF_OPTIONS,
  parsePvpBestOf,
  type PvpBestOf,
} from "@/hooks/battle/pvp/usePvpMatch";
import { EnterListener, CancelListener } from "./listeners";
import styles from "./styles.module.css";

type ChoiceState =
  | null
  | { kind: "interact"; targetId: string; targetName: string }
  | { kind: "pvpBestOf"; targetId: string; targetName: string }
  | { kind: "guildInvite"; fromId: string; fromName: string };

/** Rota do duelo; o state leva oponente, lado e tamanho da série. */
const PVP_ROUTE = "/battle/pvp";

export function SocialOverlay() {
  const navigate = useNavigate();
  const online = useOnline();
  const playerCtx = usePlayer();
  const player = playerCtx.player;
  const location = useLocation();
  const { send, subscribe } = useBattleSocket(online.roomId, online.playerId);

  const [choice, setChoice] = useState<ChoiceState>(null);
  const [pendingInvite, setPendingInvite] = useState<{
    fromId: string;
    fromName: string;
  } | null>(null);
  const [pendingPvp, setPendingPvp] = useState<{
    fromId: string;
    fromName: string;
    bestOf: PvpBestOf;
  } | null>(null);
  /** x1 que eu mandei e ainda espera resposta (o aceite chega sem `bestOf`). */
  const sentPvpRef = useRef<{ to: string; bestOf: PvpBestOf } | null>(null);

  // Detecta jogador remoto à frente
  const frontTile = (() => {
    const dx =
      player.direction === "left" ? -1 : player.direction === "right" ? 1 : 0;
    const dy =
      player.direction === "up" ? -1 : player.direction === "down" ? 1 : 0;
    return { x: player.gridX + dx, y: player.gridY + dy };
  })();

  const remoteAhead = online.room?.players.find(
    (p) =>
      p.id !== online.playerId &&
      p.scene === location.pathname &&
      p.x === frontTile.x &&
      p.y === frontTile.y,
  );

  // Convites e respostas chegam por assinatura: com `lastMessage` um
  // `roomState` logo depois apagava o convite antes de a ChoiceBox abrir.
  const playerId = online.playerId;
  const setGuildId = online.setGuildId;
  useEffect(() => {
    const forMe = (msg: BattleSocketMessage) => msg.to === playerId;
    const offPvpInvite = subscribe("pvpInvite", (msg) => {
      if (!forMe(msg)) return;
      setPendingPvp({
        fromId: String(msg.from),
        fromName: String((msg.fromName as string) ?? "Jogador"),
        bestOf: parsePvpBestOf(msg.bestOf),
      });
    });
    const offGuildInvite = subscribe("guildInvite", (msg) => {
      if (!forMe(msg)) return;
      setPendingInvite({
        fromId: String(msg.from),
        fromName: (msg.fromName as string) ?? "Jogador",
      });
    });
    const offGuildResponse = subscribe("guildResponse", (msg) => {
      if (!forMe(msg) || !msg.accept) return;
      setGuildId(String(msg.from));
    });
    const offPvpResponse = subscribe("pvpResponse", (msg) => {
      if (!forMe(msg)) return;
      const sent = sentPvpRef.current;
      if (!sent || sent.to !== String(msg.from)) return;
      sentPvpRef.current = null;
      if (!msg.accept) return;
      void navigate(PVP_ROUTE, {
        state: {
          pvpOpponentId: sent.to,
          pvpSide: "left",
          pvpBestOf: sent.bestOf,
        },
      });
    });
    return () => {
      offPvpInvite();
      offGuildInvite();
      offGuildResponse();
      offPvpResponse();
    };
  }, [subscribe, playerId, setGuildId, navigate]);

  if (!online.connected) return null;

  // HUD de guilda (canto inferior esquerdo)
  const guildMate = online.room?.players.find((p) => p.id === online.guildId);

  return (
    <>
      {guildMate && (
        <div className={styles.guildOverlay}>
          <img
            src={playerPath(
              `${guildMate.character ?? "drika"}/expressions/default.svg`,
            )}
            alt={guildMate.name}
            width={32}
            height={32}
            style={{ borderRadius: "50%" }}
          />
          <div className={styles.guildInfo}>
            <p>Você</p>
            <p>{online.playerName}</p>
            <p>{guildMate.name}</p>
          </div>
        </div>
      )}

      {/* Interação: tecla Enter quando há jogador à frente */}
      {remoteAhead && (
        <div className={`hint ${styles.interactHint}`}>
          [L] Interagir com {remoteAhead.name}
        </div>
      )}

      {choice?.kind === "interact" && (
        <ChoiceBox
          prompt={`Interagir com ${choice.targetName}`}
          options={["Convidar para guilda", "Adicionar amigo", "Chamar pro x1"]}
          onSelect={(idx) => {
            if (idx === 0) {
              send({
                type: "guildInvite",
                to: choice.targetId,
                from: online.playerId,
                fromName: online.playerName,
              });
            } else if (idx === 2) {
              setChoice({
                kind: "pvpBestOf",
                targetId: choice.targetId,
                targetName: choice.targetName,
              });
              return;
            }
            setChoice(null);
          }}
        />
      )}

      {choice?.kind === "pvpBestOf" && (
        <ChoiceBox
          prompt={`x1 contra ${choice.targetName}`}
          options={PVP_BEST_OF_OPTIONS.map((n) =>
            n === 1 ? "Melhor de 1" : `Melhor de ${n}`,
          )}
          onSelect={(idx) => {
            const bestOf = PVP_BEST_OF_OPTIONS[idx] ?? 1;
            sentPvpRef.current = { to: choice.targetId, bestOf };
            send({
              type: "pvpInvite",
              to: choice.targetId,
              from: online.playerId,
              fromName: online.playerName,
              bestOf,
            });
            setChoice(null);
          }}
        />
      )}

      {pendingInvite && (
        <ChoiceBox
          prompt={`${pendingInvite.fromName} convidou você para a guilda`}
          options={["Entrar para guilda", "Recusar"]}
          onSelect={(idx) => {
            send({
              type: "guildResponse",
              to: pendingInvite.fromId,
              from: online.playerId,
              accept: idx === 0,
            });
            if (idx === 0) online.setGuildId(pendingInvite.fromId);
            setPendingInvite(null);
          }}
        />
      )}

      {pendingPvp && (
        <ChoiceBox
          prompt={`${pendingPvp.fromName} chamou você para um x1 (${
            pendingPvp.bestOf === 1
              ? "melhor de 1"
              : `melhor de ${pendingPvp.bestOf}`
          })`}
          options={["Aceitar", "Recusar"]}
          onSelect={(idx) => {
            send({
              type: "pvpResponse",
              to: pendingPvp.fromId,
              from: online.playerId,
              accept: idx === 0,
            });
            if (idx === 0) {
              void navigate(PVP_ROUTE, {
                state: {
                  pvpOpponentId: pendingPvp.fromId,
                  pvpSide: "right",
                  pvpBestOf: pendingPvp.bestOf,
                },
              });
            }
            setPendingPvp(null);
          }}
        />
      )}

      {/* Trigger de interação por tecla Enter */}
      {remoteAhead && (
        <EnterListener
          onEnter={() =>
            setChoice({
              kind: "interact",
              targetId: remoteAhead.id,
              targetName: remoteAhead.name,
            })
          }
        />
      )}

      <CancelListener
        onCancel={() => {
          setChoice(null);
          setPendingInvite(null);
        }}
      />
    </>
  );
}
