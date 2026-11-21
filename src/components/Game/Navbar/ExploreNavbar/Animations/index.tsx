import { useState } from "react";
import { useAnimationsMenu } from "@/hooks/menu/useAnimations";

import { hideBrokenImage } from "@/utils/hideBrokenImage";

import styles from "./styles.module.css";
import { navbarIconPath } from "@/utils/paths";

export function Animations() {
  const { options, selectedIndex, onSelect } = useAnimationsMenu();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen((prev) => !prev)} className={styles.animationButton}>
        <img src={navbarIconPath("animations.svg")}/>
      </button>

      {isOpen && (
        <div className={styles.animationButtonsContainer}>
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
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
