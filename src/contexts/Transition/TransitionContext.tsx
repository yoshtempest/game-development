import { useLatestRef } from "@/hooks/useLatestRef";
import styles from "./styles.module.css";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";

import {
  useLocation,
  useNavigate,
  type NavigateOptions,
  type To,
} from "react-router";

type TransitionPhase = "idle" | "cover" | "reveal";

type TransitionContextType = {
  isFading: boolean;
  navigateWithFade: (
    to: To | number,
    options?: NavigateOptions,
  ) => void;
};

const BLIND_COUNT = 40;
const BLIND_DURATION = 220;
const BLIND_STAGGER = 8;

const TRANSITION_DURATION =
  BLIND_DURATION + (BLIND_COUNT - 1) * BLIND_STAGGER;

const TransitionContext =
  createContext<TransitionContextType | null>(null);

export function TransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [phase, setPhase] = useState<TransitionPhase>("idle");

  const pendingRef = useRef<{
    to: To;
    options?: NavigateOptions;
  } | null>(null);

  const isFadingRef = useLatestRef(phase !== "idle");

  const currentPath =
    location.pathname + location.search + location.hash;

  const prevPathRef = useRef(currentPath);

  const navigateWithFade = useCallback(
    (to: To | number, options?: NavigateOptions) => {
      if (typeof to === "number") {
        void navigate(to);
        return;
      }

      if (isFadingRef.current) return;

      pendingRef.current = { to, options };
      setPhase("cover");
    },
    [navigate, isFadingRef],
  );

  // Aguarda as faixas cobrirem a tela antes de navegar.
  useEffect(() => {
    if (phase !== "cover" || !pendingRef.current) {
      return undefined;
    }

    const id = window.setTimeout(() => {
      const pending = pendingRef.current;

      if (!pending) return;

      pendingRef.current = null;
      void navigate(pending.to, pending.options);
    }, TRANSITION_DURATION);

    return () => window.clearTimeout(id);
  }, [phase, navigate]);

  // Quando a rota muda, começa a revelar a nova página.
  useEffect(() => {
    if (prevPathRef.current === currentPath) {
      return undefined;
    }

    prevPathRef.current = currentPath;

    if (phase !== "cover") {
      return undefined;
    }

    setPhase("reveal");

    return undefined;
  }, [currentPath, phase]);

  // Após a abertura das persianas, remove a sobreposição.
  useEffect(() => {
    if (phase !== "reveal") {
      return undefined;
    }

    const id = window.setTimeout(() => {
      setPhase("idle");
    }, TRANSITION_DURATION);

    return () => window.clearTimeout(id);
  }, [phase]);

  const value = useMemo(
    () => ({
      isFading: phase !== "idle",
      navigateWithFade,
    }),
    [phase, navigateWithFade],
  );

  return (
    <TransitionContext.Provider value={value}>
      {children}

      {phase !== "idle" && (
        <div
          className={`${styles.blinds} ${
            phase === "cover" ? styles.cover : styles.reveal
          }`}
          aria-hidden="true"
        >
          {Array.from({ length: BLIND_COUNT }, (_, index) => {
            const reverseIndex = BLIND_COUNT - 1 - index;

            const animationIndex =
              phase === "cover" ? index : reverseIndex;

            const style: CSSProperties = {
              animationDelay: `${animationIndex * BLIND_STAGGER}ms`,
            };

            return (
              <div
                key={index}
                className={styles.blind}
                style={style}
              />
            );
          })}
        </div>
      )}
    </TransitionContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTransitionCtx() {
  const ctx = useContext(TransitionContext);

  if (!ctx) {
    throw new Error(
      "useTransitionCtx precisa do TransitionProvider",
    );
  }

  return ctx;
}