import { HealthBar } from "@/components/Game/Battle/HUD/HealthBar";
import { playerPath } from "@/utils/paths";
import type { BattleHudPartner } from "@/components/Game/Battle/HUD/types";
import styles from "./styles.module.css";

type Props = {
  partner: BattleHudPartner;
};

/**
 * Vida do parceiro no 2v1 contra NPC (#548), logo abaixo do painel do jogador
 * local: os dois veem a barra um do outro sem precisar olhar para o avatar.
 */
export function PartnerHUDPanel({ partner }: Props) {
  return (
    <div className={styles.panel} aria-label={`Vida de ${partner.name}`}>
      <img
        loading="lazy"
        decoding="async"
        src={playerPath(`${partner.character}/expressions/default.svg`)}
        alt={partner.name}
        className={styles.face}
      />
      <div className={styles.info}>
        <span className={styles.name}>{partner.name}</span>
        <HealthBar hp={partner.hp} maxHp={partner.maxHp} />
      </div>
    </div>
  );
}
