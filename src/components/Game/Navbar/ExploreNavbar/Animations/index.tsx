import { useAnimationsMenu } from "@/hooks/menu/useAnimations";

import { hideBrokenImage } from "@/utils/hideBrokenImage";

import styles from "./styles.module.css";

export function Animations() {
  const { options, selectedIndex, onSelect } = useAnimationsMenu();

  return (
    <div className="containerOfNavbar">
      <h2>Animações</h2>

      <ul className={styles.list}>
        {options.map((option, index) => (
          <li
            key={option.id}
            className={`${styles.card} ${
              index === selectedIndex ? styles.selected : ""
            }`}
            onClick={() => onSelect(index)}
          >
            <img
              loading="lazy"
              decoding="async"
              className={styles.icon}
              src={option.icon}
              alt=""
              onError={hideBrokenImage}
            />
            <div className={styles.info}>
              <span className={styles.label}>{option.label}</span>
              <span className={styles.description}>{option.description}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
