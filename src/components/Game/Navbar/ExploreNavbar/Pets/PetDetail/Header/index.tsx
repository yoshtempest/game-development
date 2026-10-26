import styles from "./styles.module.css";
import shared from "@/components/Game/Navbar/ExploreNavbar/Pets/PetDetail/styles.module.css";

type Props = {
  name: string;
  onClose: () => void;
};

export function PetDetailHeader({ name, onClose }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.headerTitle}>
        <span className={shared.headerLabel}>DelíciaDex - PetEdition</span>

        <h3>{name}</h3>
      </div>

      <button className={styles.backBtn} onClick={onClose} type="button">
        ← VOLTAR
      </button>
    </header>
  );
}
