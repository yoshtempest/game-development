import { useNavigate } from "react-router";
import { ChevronDown, Gamepad2 } from "lucide-react";
import { rootAssetPath } from "@/utils/paths";
import shared from "@/pages/Landing/styles.module.css";
import styles from "./styles.module.css";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className={styles.hero}>
      <div className={styles.heroOverlay} />
      <div className={styles.heroContent}>
        <img
          loading="lazy"
          decoding="async"
          src={rootAssetPath("logo.svg")}
          alt="Jomasio Adventures"
          className={styles.logo}
        />
        <p className={styles.subtitle}>
          Um RPG de aventura pelos corredores do Jomásio, cheio de bosses,
          amigos e momentos inesquecíveis
        </p>
        <button className="ctaButton" onClick={() => navigate("/")}>
          <Gamepad2 size={24} />
          Começar Aventura
        </button>
        <div className={styles.scrollIndicator}>
          <span>Role para conhecer mais</span>
          <ChevronDown size={24} className={shared.bounce} />
        </div>
      </div>
    </section>
  );
}
