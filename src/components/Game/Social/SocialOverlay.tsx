import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useOnline } from "@/contexts/OnlineContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useBattleSocket } from "@/hooks/useBattleSocket";
import { ChoiceBox } from "@/components/Game/Interactions/ChoiceBox";
import { playerPath } from "@/utils/paths";

type ChoiceState =
  | null
  | { kind: "interact"; targetId: string; targetName: string }
  | { kind: "guildInvite"; fromId: string; fromName: string };

export function SocialOverlay() {
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

  if (!online.connected) return null;

  // HUD de guilda (canto inferior esquerdo)
  const guildMate = online.room?.players.find(
    (p) => p.id === online.guildId,
  );

  return (
    <>
      {guildMate && (
        <div
          style={{
            position: "fixed",
            left: 12,
            bottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(0,0,0,0.6)",
            padding: 8,
            borderRadius: 8,
            color: "#fff",
            zIndex: 1000,
          }}
        >
          <img
            src={playerPath(`${guildMate.character ?? "drika"}/expressions/default.svg`)}
            alt={guildMate.name}
            width={32}
            height={32}
            style={{ borderRadius: "50%" }}
          />
          <div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Você</div>
            <div style={{ fontSize: 12 }}>{online.playerName}</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
              {guildMate.name}
            </div>
          </div>
        </div>
      )}

      {/* Interação: tecla Enter quando há jogador à frente */}
      {remoteAhead && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            padding: 8,
            borderRadius: 8,
            zIndex: 1000,
          }}
        >
          Pressione Enter para interagir com {remoteAhead.name}
        </div>
      )}

      {choice?.kind === "interact" && (
        <ChoiceBox
          prompt={`Interagir com ${choice.targetName}`}
          options={["Convidar para guilda", "Adicionar amigo"]}
          onSelect={(idx) => {
            if (idx === 0) {
              send({
                type: "guildInvite",
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

function EnterListener({ onEnter }: { onEnter: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") onEnter();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onEnter]);
  return null;
}

function CancelListener({ onCancel }: { onCancel: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);
  return null;
}