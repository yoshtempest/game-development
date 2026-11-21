import { lazy, Suspense } from "react";
import type { AnimationEvent, ComponentType, LazyExoticComponent } from "react";

import styles from "./styles.module.css";
import { useNavbarMenu } from "@/hooks/menu/useNavbar";
import { useNavbar } from "@/contexts/NavbarContext";
import { NavbarContainer } from "@/components/Game/Navbar/NavbarContainer";
import { hideBrokenImage } from "@/utils/hideBrokenImage";
import type { MenuScreen } from "@/utils/types/player/navbar";

function lazyNamed<K extends string>(
  load: () => Promise<Record<K, ComponentType>>,
  name: K,
) {
  return lazy(() => load().then((m) => ({ default: m[name] })));
}

const SCREENS: Record<MenuScreen, LazyExoticComponent<ComponentType>> = {
  player: lazyNamed(() => import("./Player"), "Player"),
  character: lazyNamed(() => import("./Character"), "Character"),
  // Atalho interno: abre o menu fundido direto no Status do personagem em uso.
  status: lazyNamed(() => import("./Status"), "Status"),
  // Atalho interno: mesma Mochila, entrando direto na aba de equipamentos.
  equipment: lazyNamed(() => import("./Inventory"), "InventoryEquipment"),
  inventory: lazyNamed(() => import("./Inventory"), "Inventory"),
  missions: lazyNamed(() => import("./Missions"), "Mission"),
  bestiary: lazyNamed(() => import("./Bestiary"), "DeliciaDex"),
  professions: lazyNamed(() => import("./Professions"), "Professions"),
  titles: lazyNamed(() => import("./Titles"), "TitlesScreen"),
  pets: lazyNamed(() => import("./Pets"), "Pets"),
  saves: lazyNamed(() => import("./Saves"), "Saves"),
  config: lazyNamed(() => import("./Config"), "Config"),
};

export function Navbar() {
  const { screen, selectedIndex, options, onSelect } = useNavbarMenu();
  const { isClosing, finishClose } = useNavbar();

  function handleCloseAnimationEnd(e: AnimationEvent<HTMLElement>) {
    if (isClosing && e.animationName === styles.slideToRight) finishClose();
  }

  if (screen === "menu") {
    return (
      <nav
        className={`${styles.navbar} ${isClosing ? styles.closing : ""}`}
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
              <img
                loading="lazy"
                decoding="async"
                className={styles.icon}
                src={item.icon}
                alt=""
                onError={hideBrokenImage}
              />
              {item.label}
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  const Screen = SCREENS[screen];

  return (
    <Suspense fallback={null}>
      <NavbarContainer>
        <Screen />
      </NavbarContainer>
    </Suspense>
  );
}
