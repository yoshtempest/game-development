type Props = {
  onlineConnected: boolean;
  opponentHP: number;
  opponentMaxHP: number;
  isBattleGuest: boolean;
  guestHasSnapshot: boolean;
  /** Só o PvP tem "oponente"; no co-op contra NPC não há barra de oponente. */
  isPvp: boolean;
};

export function OnlineBattleOverlay({
  onlineConnected,
  opponentHP,
  opponentMaxHP,
  isBattleGuest,
  guestHasSnapshot,
  isPvp,
}: Props) {
  return (
    <>
      {isPvp && onlineConnected && (
        <div
          style={{
            position: "fixed",
            top: 12,
            right: 12,
            background: "rgba(0,0,0,0.6)",
            padding: 8,
            borderRadius: 8,
            color: "#fff",
            zIndex: 100000,
            minWidth: 160,
          }}
        >
          <div style={{ fontSize: 12, marginBottom: 4 }}>Oponente</div>
          <div
            style={{
              height: 10,
              background: "#333",
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(opponentHP / opponentMaxHP) * 100}%`,
                background: "#e53935",
                transition: "width 0.2s",
              }}
            />
          </div>
          <div style={{ fontSize: 11, marginTop: 2 }}>
            {opponentHP}/{opponentMaxHP}
          </div>
        </div>
      )}

      {isBattleGuest && !guestHasSnapshot && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.8)",
            zIndex: 100003,
            color: "#fff",
            fontSize: 24,
          }}
        >
          Aguardando host...
        </div>
      )}
    </>
  );
}
