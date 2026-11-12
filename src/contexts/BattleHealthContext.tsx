import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

/**
 * Cura a vida da batalha em uma fração da vida máxima. Devolve `false` quando
 * não há o que curar (vida cheia ou player morto), para o item não ser gasto.
 */
export type BattleHealer = (ratio: number) => boolean;

export type BattleHealthApi = {
  /** Registra quem é dono da vida da batalha; devolve o cleanup do registro. */
  registerHealer: (healer: BattleHealer) => () => void;
  healByRatio: (ratio: number) => boolean;
};

const BattleHealthContext = createContext<BattleHealthApi | null>(null);

/**
 * Ponte entre a vida da batalha e o inventário de batalha.
 *
 * A vida vive no state de `useBattleHP`, dentro da `BattleScene`, e a
 * `BattleNavbar` é irmã dela no `BattlePage` — não há como passar props. O
 * dono da vida registra um `healer` aqui e o inventário só chama
 * `healByRatio`. Guardado em ref porque o registro não deve re-renderizar a
 * árvore inteira da batalha.
 */
export function BattleHealthProvider({ children }: { children: ReactNode }) {
  const healerRef = useRef<BattleHealer | null>(null);

  const registerHealer = useCallback((healer: BattleHealer) => {
    healerRef.current = healer;
    return () => {
      if (healerRef.current === healer) healerRef.current = null;
    };
  }, []);

  const healByRatio = useCallback(
    (ratio: number) => healerRef.current?.(ratio) ?? false,
    [],
  );

  const value = useMemo<BattleHealthApi>(
    () => ({ registerHealer, healByRatio }),
    [registerHealer, healByRatio],
  );

  return (
    <BattleHealthContext.Provider value={value}>
      {children}
    </BattleHealthContext.Provider>
  );
}

/** `null` fora da batalha: quem cura usa isso para cair na vida da exploração. */
// eslint-disable-next-line react-refresh/only-export-components
export function useBattleHealth(): BattleHealthApi | null {
  return useContext(BattleHealthContext);
}
