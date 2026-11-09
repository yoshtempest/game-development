import { MapPin } from "lucide-react";
import { locations } from "@/data/landing";
import shared from "@/pages/Landing/styles.module.css";
import styles from "./styles.module.css";

export function Locations() {
  return (
    <section className={`${shared.section} ${shared.darkSection}`}>
      <div className={shared.sectionInner}>
        <h2 className={shared.sectionTitle}>
          <MapPin size={28} />
          Explore o Mundo
        </h2>
        <p className={shared.sectionDesc}>
          Cada sala da escola esconde segredos, NPCs e desafios únicos
        </p>
        <div className={styles.locationsGrid}>
          {locations.map((loc) => (
            <div key={loc.name} className={styles.locationCard}>
              <img loading="lazy" decoding="async"
                src={loc.image}
                alt={loc.name}
                className={styles.locationImage}
              />
              <span className={styles.locationName}>{loc.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
