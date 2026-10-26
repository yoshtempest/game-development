import type { PetEntry } from "@/hooks/menu/pets/usePetsMenu";
import shared from "../styles.module.css";
import styles from "./styles.module.css";

type Props = {
  entry: PetEntry;
};

export function PetAbilities({ entry }: Props) {
  return (
    <section className={styles.abilitiesSection}>
      <div className={styles.abilityCard}>
        <span className={shared.sectionEyebrow}>
          HABILIDADE PASSIVA
        </span>

        <h4>{entry.passiveName}</h4>
      </div>

      <div className={styles.abilityCard}>
        <span className={shared.sectionEyebrow}>
          HABILIDADE ATIVA
        </span>

        <h4>{entry.skillName}</h4>
      </div>
    </section>
  );
}