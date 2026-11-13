import { Heart, HeartCrack } from "lucide-react";

import { getPetAffinityMultiplier } from "@/gameRules/pets/affinity";
import {
  PET_AFFINITY_MAX,
  PET_AFFINITY_WINS_PER_STAR,
  type PetAffinityEntry,
} from "@/data/characters/pets/petAffinity";

import shared from "@/components/Game/Navbar/ExploreNavbar/Pets/PetDetail/styles.module.css";
import styles from "./styles.module.css";

type Props = {
  affinity: PetAffinityEntry;
  owned: boolean;
  onPet: () => void;
};

/**
 * Barra de afinidade (#418/#74): corações cheios para afeição, corações
 * partidos para ódio — os dois lados no mesmo componente porque a escala é
 * uma só (-5..+5). O bônus em batalha é mostrado em % para o jogador ver o
 * efeito do carinho sem conhecer a fórmula.
 */
export function PetAffinity({ affinity, owned, onPet }: Props) {
  const value = affinity.value;
  const hate = value < 0;
  const filled = Math.abs(value);
  const bonusPercent = Math.round((getPetAffinityMultiplier(value) - 1) * 100);
  const Icon = hate ? HeartCrack : Heart;
  const label = hate ? "Ódio" : value > 0 ? "Afeição" : "Neutro";

  return (
    <section className={styles.affinityPanel}>
      <div className={styles.headerRow}>
        <span className={shared.sectionEyebrow}>AFINIDADE</span>
        <span className={hate ? styles.hateLabel : styles.loveLabel}>
          {label} {filled}/{PET_AFFINITY_MAX}
        </span>
      </div>

      <div
        className={styles.hearts}
        aria-label={`Afinidade ${value} de ${PET_AFFINITY_MAX}`}
      >
        {Array.from({ length: PET_AFFINITY_MAX }, (_, i) => (
          <Icon
            key={i}
            size={18}
            className={
              i < filled
                ? hate
                  ? styles.heartHate
                  : styles.heartLove
                : styles.heartEmpty
            }
            fill={i < filled ? "currentColor" : "transparent"}
          />
        ))}
      </div>

      <div className={styles.footerRow}>
        <span className={styles.hint}>
          Bônus em batalha: {bonusPercent >= 0 ? "+" : ""}
          {bonusPercent}% · vitórias {affinity.battleWins}/
          {PET_AFFINITY_WINS_PER_STAR}
        </span>
        {owned && (
          <button type="button" className={styles.petButton} onClick={onPet}>
            CARINHO
          </button>
        )}
      </div>
    </section>
  );
}
