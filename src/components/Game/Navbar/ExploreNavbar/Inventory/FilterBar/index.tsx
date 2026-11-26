import { useEffect, useRef } from "react";
import { FILTER_LABELS } from "@/data/inventory/labels";
import styles from "./styles.module.css";
import {
  itemFilterPath,
  navbarIconPath,
} from "@/utils/paths";

type Props = {
  filterType: string;
  filterFocused: boolean;
  onFilterChange: (type: string) => void;
};

export function FilterBar({
  filterType,
  filterFocused,
  onFilterChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const el = container.querySelector<HTMLElement>(
      `[data-type="${filterType}"]`,
    );
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [filterType]);

  return (
    <div ref={containerRef} className={`${styles.container} hideScrollbar`}>
      {FILTER_LABELS.map((filter) => (
        <span key={filter.type} className={styles.item}>
          {filter.separator && <span className={styles.separator} />}
          <button
            data-type={filter.type}
            className={`${styles.button} ${
              filterType === filter.type ? styles.buttonActive : ""
            } ${
              filterFocused && filterType === filter.type
                ? styles.buttonFocused
                : ""
            }`}
            onClick={() => onFilterChange(filter.type)}
            title={filter.label}
            aria-label={filter.label}
          >
            <img
              loading="lazy"
              decoding="async"
              src={
                filter.iconKind === "navbar"
                  ? navbarIconPath(filter.src)
                  : itemFilterPath(filter.src)
              }
              alt=""
              className={styles.image}
            />
          </button>
        </span>
      ))}
    </div>
  );
}
