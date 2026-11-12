type Props = {
  visible: boolean;
  reconnecting: boolean;
};

export function ConnectionOverlay({ visible, reconnecting }: Props) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
        zIndex: 100002,
        color: "#fff",
        fontSize: 24,
      }}
    >
      {reconnecting ? "Reconectando..." : "Conexão perdida"}
    </div>
  );
}
