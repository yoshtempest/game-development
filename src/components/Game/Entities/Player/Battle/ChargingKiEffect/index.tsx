import { playerPathEmatronHabilities } from "@/utils/paths";
import styles from "@/components/Game/Entities/Player/Battle/styles.module.css";

interface ChargingKiEffectProps {
  width: number;
  height: number;
}

export function ChargingKiEffect({ width, height }: ChargingKiEffectProps) {
  return (
    <img
      src={playerPathEmatronHabilities("/chargingKi/chargingKiEffect.svg")}
      className={styles.chargingKiEffect}
      style={{
        height,
        width,
        left: "50%",
        bottom: 0,
        transform: "translateX(-50%)",
      }}
    />
  );
}
