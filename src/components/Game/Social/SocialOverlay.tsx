import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useOnline } from "@/contexts/OnlineContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useBattleSocket } from "@/hooks/useBattleSocket";
import { ChoiceBox } from "@/components/Game/Interactions/ChoiceBox";
import { playerPath } from "@/utils/paths";
import { EnterListener, CancelListener } from "./listeners";
import styles from "./styles.module.css";

type ChoiceState =
  | null
  | { kind: "interact"; targetId: string; targetName: string }
  | { kind: "guildInvite"; fromId: string; fromName: string };

export function SocialOverlay() {
  const navigate = useNavigate();
  const online = useOnline();
  const playerCtx = usePlayer();
  const player = playerCtx.player;
  const location = useLocation();
  const { send, lastMessage } = useBattleSocket(online.roomId, online.playerId);

  const [choice, setChoice] = useState<ChoiceState>(null);
  const [pendingInvite, setPendingInvite] = useState<{
    fromId: string;
    fromName: string;
  } | null>(null);
  const [pendingPvp, setPendingPvp] = useState<{
    fromId: string;
    fromName: string;
  } | null>(null);

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

  // Recebe convite de x1
  useEffect(() => {
    if (!lastMessage || lastMessage.type !== "pvpInvite") return;
    if (lastMessage.to !== online.playerId) return;
    setPendingPvp({
      fromId: String(lastMessage.from),
      fromName: String((lastMessage.fromName as string) ?? "Jogador"),
    });
  }, [lastMessage, online.playerId]);

  // Recebe convite de guilda
  useEffect(() => {
    if (!lastMessage || lastMessage.type !== "guildInvite") return;
    if (lastMessage.to !== online.playerId) return;
    setPendingInvite({
      fromId: String(lastMessage.from),
      fromName: (lastMessage.fromName as string) ?? "Jogador",
    });
  }, [lastMessage, online.playerId]);

  // Recebe resposta de convite
  useEffect(() => {
    if (!lastMessage || lastMessage.type !== "guildResponse") return;
    if (lastMessage.to !== online.playerId) return;
    if (lastMessage.accept) {
      const mateId = String(lastMessage.from);
      online.setGuildId(mateId);
    }
  }, [lastMessage, online]);

  // Recebe resposta de x1
  useEffect(() => {
    if (!lastMessage || lastMessage.type !== "pvpResponse") return;
    if (lastMessage.to !== online.playerId) return;
    if (lastMessage.accept) {
      void navigate("/battle/pvp");
    }
  }, [lastMessage, online.playerId, navigate]);

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
              send({
                type: "pvpInvite",
                to: choice.targetId,
                from: online.playerId,
                fromName: online.playerName,
              });
            }
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
          prompt={`${pendingPvp.fromName} chamou você para um x1`}
          options={["Aceitar", "Recusar"]}
          onSelect={(idx) => {
            send({
              type: "pvpResponse",
              to: pendingPvp.fromId,
              from: online.playerId,
              accept: idx === 0,
            });
            if (idx === 0) void navigate("/battle/pvp");
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
