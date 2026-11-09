import { Sparkles } from "lucide-react";
import { funnyMoments } from "@/data/landing";
import shared from "@/pages/Landing/styles.module.css";
import styles from "./styles.module.css";

export function FunnyMoments() {
  return (
    <section className={shared.section}>
      <div className={shared.sectionInner}>
        <h2 className={shared.sectionTitle}>
          <Sparkles size={28} />
          Momentos Inesquecíveis
        </h2>
        <p className={shared.sectionDesc}>
          O jogo é repleto de referências e situações hilárias que todo aluno do
          Jomásio vai reconhecer
        </p>
        <div className={styles.funnyGrid}>
          {funnyMoments.map((moment) => (
            <div
              key={moment.title}
              className={`${"landingCard"} ${styles.funnyCard}`}
            >
              <img loading="lazy" decoding="async"
                src={moment.image}
                alt={moment.title}
                className={styles.funnyImage}
              />
              <h3>{moment.title}</h3>
              <p>{moment.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
