import { Users } from "lucide-react";
import { characters } from "@/data/landing";
import shared from "@/pages/Landing/styles.module.css";
import styles from "./styles.module.css";

export function Characters() {
  return (
    <section className={`${shared.section} ${shared.darkSection}`}>
      <div className={shared.sectionInner}>
        <h2 className={shared.sectionTitle}>
          <Users size={28} />
          Personagens Jogáveis
        </h2>
        <p className={shared.sectionDesc}>
          Escolha entre 12 personagens, cada um com sua própria classe e estilo
          de luta
        </p>
        <div className={styles.charactersGrid}>
          {characters.map((char) => (
            <div key={char.name} className={styles.characterCard}>
              <img loading="lazy" decoding="async"
                src={char.image}
                alt={char.name}
                className={styles.characterImage}
              />
              <strong>{char.name}</strong>
              <span className={styles.characterClass}>{char.class}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
