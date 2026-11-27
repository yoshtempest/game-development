import { useState } from "react";
import { PartyPopper } from "lucide-react";

import { useAnimationsMenu } from "@/hooks/menu/useAnimations";

import { hideBrokenImage } from "@/utils/hideBrokenImage";

import styles from "./styles.module.css";
import { navbarIconPath } from "@/utils/paths";

export function Animations() {
  const { options, selectedIndex, onSelect } = useAnimationsMenu();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={styles.animationButton}
      >
        <img src={navbarIconPath("animations.svg")} alt="Animações" />
      </button>

      {isOpen && (
        <div className={styles.animationButtonsContainer}>
          <ul className={styles.list}>
            {options.map((option, index) => (
              <li
                key={option.id}
                className={`${styles.card} ${
                  index === selectedIndex ? styles.selected : ""
                } ${option.disabled ? styles.disabled : ""}`}
                title={option.label ?? option.id}
                onClick={() => onSelect(index)}
              >
                {option.icon ? (
                  <img
                    loading="lazy"
                    decoding="async"
                    className={styles.icon}
                    src={option.icon}
                    alt=""
                    onError={hideBrokenImage}
                  />
                ) : (
                  <PartyPopper className={styles.icon} size={20} />
                )}
                {option.label && (
                  <span className={styles.label}>{option.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
