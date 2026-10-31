
import { useEffect, type RefObject } from "react";

type UseAutoScrollSelectedItemProps = {
  containerRef: RefObject<HTMLDivElement | null>;
  selectedIndex: number;
};

export function useAutoScrollSelectedItem({
  containerRef,
  selectedIndex,
}: UseAutoScrollSelectedItemProps) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const element = container.querySelector<HTMLElement>(
      `[data-index="${selectedIndex}"]`,
    );

    if (!element) return;

    const elTop = element.offsetTop;
    const elBottom = elTop + element.offsetHeight;
    const { scrollTop, clientHeight } = container;

    if (elTop < scrollTop) {
      container.scrollTop = elTop;
    } else if (elBottom > scrollTop + clientHeight) {
      container.scrollTop = elBottom - clientHeight;
    }
  }, [containerRef, selectedIndex]);
}
