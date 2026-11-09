import { lazy, Suspense, useEffect, useRef } from "react";
import type { ComponentType, LazyExoticComponent } from "react";

import styles from "./styles.module.css";
import { useBattleNavbarMenu } from "@/hooks/battle/useBattleNavbarMenu";
import { useBattleNavbar } from "@/contexts/BattleNavbarContext";
import type { BattleNavScreen } from "@/utils/types/player/battleNavbar";

function lazyNamed<K extends string>(
  load: () => Promise<Record<K, ComponentType>>,
  name: K,
) {
  return lazy(() => load().then((m) => ({ default: m[name] })));
}

const SCREENS: Record<BattleNavScreen, LazyExoticComponent<ComponentType>> = {
  characters: lazyNamed(() => import("./Characters"), "Characters"),
  inventory: lazyNamed(() => import("./BattleInventory"), "BattleInventory"),
  settings: lazyNamed(() => import("./Settings"), "Settings"),
};

export function BattleNavbar() {
  const { location, selectedIndex, options, onSelect } = useBattleNavbarMenu();
  const { isClosing, finishClose } = useBattleNavbar();
  const finishCloseRef = useRef(finishClose);
  finishCloseRef.current = finishClose;

  useEffect(() => {
    if (!isClosing) return;
    const id = setTimeout(() => finishCloseRef.current(), 600);
    return () => clearTimeout(id);
  }, [isClosing]);

  function handleCloseAnimationEnd() {
    if (isClosing) finishClose();
  }

  if (location === "menu") {
    return (
      <nav
        className={`${styles.battleNavbar} ${isClosing ? styles.closing : ""}`}
        onAnimationEnd={handleCloseAnimationEnd}
      >
        <ul className={styles.list}>
          {options.map((item, index) => (
            <li
              key={item.label}
              className={`${styles.item} ${
                selectedIndex === index ? "active" : ""
              }`}
              onClick={() => onSelect(index)}
            >
              <img loading="lazy" decoding="async" className={styles.icon} src={item.icon} alt="" />
              {item.label}
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  const Screen = SCREENS[location];

  return (
    <Suspense fallback={null}>
      <Screen />
    </Suspense>
  );
}
