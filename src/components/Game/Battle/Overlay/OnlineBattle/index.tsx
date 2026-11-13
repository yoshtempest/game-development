type Props = {
  isBattleGuest: boolean;
  guestHasSnapshot: boolean;
};

/**
 * Cortina do guest do co-op até o primeiro snapshot do líder. O placar e o HP
 * do oponente do PvP moram no `PvpMatchOverlay` e no painel do HUD.
 */
export function OnlineBattleOverlay({
  isBattleGuest,
  guestHasSnapshot,
}: Props) {
  if (!isBattleGuest || guestHasSnapshot) return null;
  return (
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
  );
}
