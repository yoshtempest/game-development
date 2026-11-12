import { useEffect, useRef, useState } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { FIFTY_MS, FOUR_HUNDRED_FIFTY_MS } from "@/data/ms";
import { formatCompactNumber } from "@/utils/formatCompactNumber";
import styles from "./styles.module.css";

/**
 * Janela sem dano antes de iniciar a redução da parte vermelha.
 *
 * O dano real sai do HP no código da batalha imediatamente; a barra mantém
 * visualmente o nível anterior e marca a parcela perdida em vermelho. Se a
 * entidade sofrer novo dano dentro desta janela, a parte vermelha permanece
 * (e se estende); ao passar a janela sem dano, ela é reduzida com animação.
 */
const IDLE_GRACE_MS = FIFTY_MS;

/** Duração da animação de redução da parte vermelha. */
const DRAIN_MS = FOUR_HUNDRED_FIFTY_MS;

type Props = {
  hp: number;
  maxHp?: number;
  reversed?: boolean;
};

export function HealthBar({ hp, maxHp = 100, reversed = false }: Props) {
  const [visibleHp, setVisibleHp] = useState(hp);
  const [draining, setDraining] = useState(false);

  const prevHpRef = useRef(hp);
  const graceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hpRef = useLatestRef(hp);
  const visibleHpRef = useLatestRef(visibleHp);

  useEffect(() => {
    return () => {
      if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const prev = prevHpRef.current;
    prevHpRef.current = hp;

    if (hp > prev) {
      if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
      setDraining(false);
      setVisibleHp(hp);
      return;
    }

    if (hp < prev) {
      if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
      setDraining(false);
      setVisibleHp((v) => Math.max(v, prev));
      graceTimerRef.current = setTimeout(
        () => setDraining(true),
        IDLE_GRACE_MS,
      );
    }
  }, [hp]);

  useEffect(() => {
    if (!draining) return;

    const from = visibleHpRef.current;
    const to = hpRef.current;
    const start = performance.now();
    let raf = 0;

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DRAIN_MS);
      const eased = 1 - (1 - t) ** 3;
      setVisibleHp(from + (to - from) * eased);
      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setVisibleHp(to);
        setDraining(false);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [draining, hpRef, visibleHpRef]);

  const visiblePercentage = Math.max(
    0,
    Math.min(100, (visibleHp / maxHp) * 100),
  );
  const percentage = Math.max(0, Math.min(100, (hp / maxHp) * 100));

  const lossPercentage = visiblePercentage - percentage;
  const hasLoss = lossPercentage > 0.5;

  function getBackgroundColor() {
    if (visiblePercentage <= 30) {
      return "linear-gradient(90deg, hsl(0, 100%, 88%) 0%, hsl(0, 95%, 65%) 40%, hsl(350, 90%, 52%) 100%)";
    } else if (visiblePercentage <= 70) {
      return "linear-gradient(90deg, hsl(40, 100%, 90%) 0%, hsl(35, 100%, 68%) 40%, hsl(20, 82%, 70%) 100%)";
    } else {
      return "linear-gradient(90deg, hsl(180, 100%, 88%) 0%, hsl(180, 100%, 65%) 40%, hsl(175, 100%, 52%) 70%, hsl(147, 68%, 49%) 100%)";
    }
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.fill}
        style={{
          width: `${visiblePercentage}%`,
          background: getBackgroundColor(),
          ...(reversed ? { marginLeft: `${100 - visiblePercentage}%` } : {}),
        }}
      />
      {hasLoss && (
        <div
          className={styles.loss}
          style={{
            left: `${reversed ? 100 - visiblePercentage : percentage}%`,
            width: `${lossPercentage}%`,
          }}
        />
      )}
      <div className={styles.text}>
        {/* `ceil` e nao `round`: o HP pode ser fracionario (o piso de dano e
            0.01), e arredondar mostrava "1000 / 1000" com a barra em 99.96%. */}
        {formatCompactNumber(Math.ceil(hp))} / {formatCompactNumber(maxHp)}
      </div>
    </div>
  );
}
