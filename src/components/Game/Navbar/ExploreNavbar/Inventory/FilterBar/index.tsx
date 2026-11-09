import { useEffect, useRef } from "react";
import { FILTER_LABELS } from "@/data/inventory/labels";
import styles from "./styles.module.css";
import { itemFilterPath, professionBadgePath } from "@/utils/paths";

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
      {FILTER_LABELS.map((f) => (
        <span key={f.type} className={styles.item}>
          {f.separator && <div className={styles.separator} />}
          <button
            data-type={f.type}
            className={`${styles.button} ${
              filterType === f.type ? styles.buttonActive : ""
            } ${filterFocused && filterType === f.type ? styles.buttonFocused : ""}`}
            onClick={() => onFilterChange(f.type)}
          >
            <img loading="lazy" decoding="async"
              src={
                f.type.startsWith("prof_")
                  ? professionBadgePath(f.src)
                  : itemFilterPath(f.src)
              }
              className={styles.image}
            />
            {f.label}
          </button>
        </span>
      ))}
    </div>
  );
}
