import { HealthBar } from "@/components/Game/Battle/HUD/HealthBar";
import { Deliciometro } from "@/components/Game/Battle/HUD/Deliciometro";
import { BlockGauge } from "@/components/Game/Battle/HUD/BlockGauge";
import { playerPath } from "@/utils/paths";
import styles from "./styles.module.css";

type Props = {
  pchar: string;
  php: number;
  pmaxhp: number;
  pshield: number;
  del: number;
  hits: number;
  blockGauge: number;
  blockLimit: number;
};

export function HudPlayer({
  pchar,
  php,
  pmaxhp,
  pshield,
  del,
  hits,
  blockGauge,
  blockLimit,
}: Props) {
  const playerName = localStorage.getItem("playerName") || "Protagonista";

  return (
    <div className={styles.container}>
      <div className="hudFlexColumn">
        <img
          src={playerPath(`/${pchar}/face.svg`)}
          alt="Player HUD"
          className="hudImage"
        />
        <BlockGauge blockGauge={blockGauge} blockLimit={blockLimit} />
      </div>
      
      <div className={styles.info}>
        <h2 className={`${"hudName"} ${styles.name}`}>{playerName}</h2>
        <div className="hudFlexRow">
          <HealthBar hp={php} maxHp={pmaxhp} />
          {pshield > 0 && (
            <div className="shieldTrack">
              <div
                className="shieldFill"
                style={{
                  width: `${Math.min(100, (pshield / pmaxhp) * 100)}%`,
                }}
              />
            </div>
          )}   
        </div>
        <Deliciometro delicia={del} hitsToSpecial={hits} />
      </div>
    </div>
  );
}
