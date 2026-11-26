import { useState } from "react";

import {
  YVEL_WEAPONS,
  YVEL_WEAPON_LABELS,
  type YvelWeapon,
} from "@/data/characters/yvel/yvelWeapons";
import { playerPath } from "@/utils/paths";

import styles from "./styles.module.css";

type Props = {
  open: boolean;
  currentWeapon?: YvelWeapon;
  accent: string;
  title: string;
  onSelect: (weapon: YvelWeapon) => void;
  onClose: () => void;
};

/**
 * Arsenal do Unlimited Blade Works (issue #219): todas as armas do yvel, a
 * batalha pausada por trás. Clicar fora fecha sem trocar.
 *
 * O ícone reusa o mesmo arquivo do botão de troca (`/yvel/<arma>.svg`). Arma
 * sem sprite ainda (o autor adiciona aos poucos) cai no rótulo: o `onError`
 * esconde a imagem quebrada em vez de mostrar o ícone de erro do browser.
 */
export function YvelArsenal({
  open,
  currentWeapon,
  accent,
  title,
  onSelect,
  onClose,
}: Props) {
  const [missingIcons, setMissingIcons] = useState<ReadonlySet<YvelWeapon>>(
    () => new Set(),
  );

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.panel}
        style={{ borderColor: accent }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.title} style={{ color: accent }}>
          {title}
        </h2>
        <div className={styles.grid}>
          {YVEL_WEAPONS.map((weapon) => {
            const current = weapon === currentWeapon;
            const label = YVEL_WEAPON_LABELS[weapon];
            return (
              <button
                key={weapon}
                type="button"
                className={styles.weapon}
                disabled={current}
                onClick={() => onSelect(weapon)}
              >
                {!missingIcons.has(weapon) && (
                  <img
                    src={playerPath(`/yvel/${weapon}.svg`)}
                    alt=""
                    width={48}
                    height={48}
                    loading="lazy"
                    decoding="async"
                    onError={() =>
                      setMissingIcons((prev) => new Set(prev).add(weapon))
                    }
                  />
                )}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
