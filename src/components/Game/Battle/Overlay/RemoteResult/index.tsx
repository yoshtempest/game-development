type Props = {
  visible: boolean;
  result: "victory" | "defeat" | null;
};

export function RemoteResultOverlay({ visible, result }: Props) {
  if (!visible || !result) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
        zIndex: 100001,
        color: "#fff",
        fontSize: 32,
      }}
    >
      {result === "victory" ? "Vitória" : "Derrota"}
    </div>
  );
}