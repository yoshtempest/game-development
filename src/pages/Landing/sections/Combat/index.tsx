import { Sword, Zap, Shield, Sparkles, ScrollText } from "lucide-react";
import { bosses } from "@/data/landing";
import shared from "@/pages/Landing/styles.module.css";
import styles from "./styles.module.css";

export function Combat() {
  return (
    <section className={shared.section}>
      <div className={shared.sectionInner}>
        <h2 className={shared.sectionTitle}>
          <Sword size={28} />
          Sistema de Combate
        </h2>
        <div className={styles.combatGrid}>
          <div className={`${"landingCard"} ${styles.combatCard}`}>
            <Zap size={32} className={styles.combatIcon} />
            <h3>Combate em Turnos</h3>
            <p>
              Batalhe contra NPCs em combates turno-based com ataques, esquivas,
              bloqueios e habilidades especiais.
            </p>
          </div>
          <div className={`${"landingCard"} ${styles.combatCard}`}>
            <Shield size={32} className={styles.combatIcon} />
            <h3>Classes Únicas</h3>
            <p>
              Cada personagem possui uma classe com habilidades próprias.
              Escolha a que melhor se adapta ao seu estilo!
            </p>
          </div>
          <div className={`${"landingCard"} ${styles.combatCard}`}>
            <Sparkles size={32} className={styles.combatIcon} />
            <h3>Itens e Equipamentos</h3>
            <p>
              Colete itens espalhados pelo mapa, equipe armamentos e use poções
              para virar o jogo nas batalhas.
            </p>
          </div>
          <div className={`${"landingCard"} ${styles.combatCard}`}>
            <ScrollText size={32} className={styles.combatIcon} />
            <h3>Missões e Quests</h3>
            <p>
              Receba quests dos NPCs, complete objetivos e ganhe recompensas
              exclusivas.
            </p>
          </div>
        </div>
        <div className={styles.bossesSection}>
          <h3 className={styles.bossesTitle}>Bosses para enfrentar</h3>
          <div className={styles.bossesGrid}>
            {bosses.map((boss) => (
              <div key={boss.name} className={styles.bossCard}>
                <img loading="lazy" decoding="async"
                  src={boss.image}
                  alt={boss.name}
                  className={styles.bossImage}
                />
                <strong>{boss.name}</strong>
                <span className={styles.bossDesc}>{boss.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
