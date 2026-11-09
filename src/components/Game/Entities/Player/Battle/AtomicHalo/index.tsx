import { playerPathMarshadowHabilities } from "@/utils/paths";

export function AtomicHalo() {
  return (
    <img loading="lazy" decoding="async"
      src={playerPathMarshadowHabilities("/atomic/halo.svg")}
      alt=""
      style={{
        position: "absolute",
        width: "auto",
        height: "130%",
        left: "50%",
        bottom: 0,
        transform: "translateX(-50%)",
        pointerEvents: "none",
      }}
    />
  );
}
