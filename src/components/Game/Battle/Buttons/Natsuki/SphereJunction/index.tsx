import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";

import { useLatestRef } from "@/hooks/useLatestRef";
import { BlueSphereButton } from "@/components/Game/Battle/Buttons/Natsuki/BlueSphere";
import { RedSphereButton } from "@/components/Game/Battle/Buttons/Natsuki/RedSphere";
import { PurpleSphereButton } from "@/components/Game/Battle/Buttons/Natsuki/PurpleSphere";
import styles from "./styles.module.css";

type Props = {
  blueActive: boolean;
  blueDisabled: boolean;
  redDisabled: boolean;
  /** Fusão em curso (a purple está em campo): mostra só o botão roxo. */
  purpleActive: boolean;
  purpleDisabled: boolean;
  onBlue: () => void;
  onRed: () => void;
  /** Soltou uma esfera sobre a outra: funde em purple. */
  onPurple: () => void;
};

type Drag = {
  node: HTMLElement;
  other: HTMLElement | null;
  startX: number;
  startY: number;
  moved: boolean;
  pointerId: number;
};

/** Distância (px) além da qual o gesto deixa de ser um clique e vira arraste. */
const DRAG_THRESHOLD = 6;
/**
 * Fração do diâmetro da esfera em que a solta "alcança" a outra. Não exige
 * encaixe perfeito: basta levar a esfera arrastada até ~80% de distância do
 * centro da outra — perto o bastante para ser intencional, longe o bastante
 * para um leve tremor não fundir as duas.
 */
const MERGE_REACH = 0.8;

function centersCloseEnough(a: DOMRect, b: DOMRect, factor: number) {
  const ax = a.left + a.width / 2;
  const ay = a.top + a.height / 2;
  const bx = b.left + b.width / 2;
  const by = b.top + b.height / 2;
  const reach = Math.max(b.width, b.height) * factor;
  return Math.hypot(ax - bx, ay - by) <= reach;
}

/**
 * Botões blue/red do riquelme com o gesto de FUSÃO: arrastar uma esfera sobre a
 * outra as funde numa única esfera roxa (purple). Enquanto a purple está em
 * campo, os dois botões viram um só; ao terminar o disparo, blue e red voltam.
 *
 * O arraste é acompanhado por listeners nativos no `window` (e não pelos
 * handlers sintéticos do React) para que o botão siga o ponteiro mesmo saindo
 * da área do botão — sem isso o `pointermove` pararia de chegar.
 */
export function SphereJunction({
  blueActive,
  blueDisabled,
  redDisabled,
  purpleActive,
  purpleDisabled,
  onBlue,
  onRed,
  onPurple,
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<Drag | null>(null);
  // Um arraste não pode virar clique ao soltar (o `click` vem logo depois).
  const suppressClickRef = useRef(false);
  // Callbacks sempre atuais dentro dos listeners nativos.
  const handlersRef = useLatestRef({ onBlue, onRed, onPurple });

  const moveRef = useRef<(e: PointerEvent) => void>(() => {});
  const upRef = useRef<(e: PointerEvent) => void>(() => {});

  const detach = () => {
    window.removeEventListener("pointermove", moveRef.current);
    window.removeEventListener("pointerup", upRef.current);
    window.removeEventListener("pointercancel", upRef.current);
  };

  // Não deixa listeners pendurados se a cena desmontar no meio de um arraste.
  useEffect(() => detach, []);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const node = (e.target as HTMLElement | null)?.closest("button");
    if (!node || !rootRef.current) return;
    const buttons = Array.from(rootRef.current.querySelectorAll("button"));
    if (buttons.length < 2) return;

    detach();
    dragRef.current = {
      node,
      other: buttons.find((b) => b !== node) ?? null,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      pointerId: e.pointerId,
    };

    moveRef.current = (ev: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || ev.pointerId !== drag.pointerId) return;
      const dx = ev.clientX - drag.startX;
      const dy = ev.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) drag.moved = true;
      drag.node.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    upRef.current = (ev: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || ev.pointerId !== drag.pointerId) return;
      dragRef.current = null;
      detach();

      // Mede COM o transform ainda aplicado: medir depois do reset devolveria a
      // posição original e a fusão nunca dispararia.
      const draggedRect = drag.node.getBoundingClientRect();
      drag.node.style.transform = "";
      if (drag.node.hasPointerCapture(ev.pointerId)) {
        drag.node.releasePointerCapture(ev.pointerId);
      }

      if (!drag.moved) return;
      // Foi arraste: engole o clique que o browser dispara em seguida.
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);

      if (drag.other) {
        const otherRect = drag.other.getBoundingClientRect();
        if (centersCloseEnough(draggedRect, otherRect, MERGE_REACH)) {
          handlersRef.current.onPurple();
        }
      }
    };

    node.setPointerCapture(e.pointerId);
    window.addEventListener("pointermove", moveRef.current);
    window.addEventListener("pointerup", upRef.current);
    window.addEventListener("pointercancel", upRef.current);
  };

  const guard = (fn: () => void) => () => {
    if (suppressClickRef.current) return;
    fn();
  };

  return (
    <div ref={rootRef} className={styles.wrap} onPointerDown={onPointerDown}>
      {purpleActive ? (
        <PurpleSphereButton
          active
          disabled={purpleDisabled}
          onClick={onPurple}
        />
      ) : (
        <>
          <BlueSphereButton
            active={blueActive}
            disabled={blueDisabled}
            onClick={guard(onBlue)}
          />
          <RedSphereButton disabled={redDisabled} onClick={guard(onRed)} />
        </>
      )}
    </div>
  );
}
