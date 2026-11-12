import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CombatTutorialState = {
  highlightedControl: string | null;
};

type CombatTutorialActions = {
  setHighlightedControl: (value: string | null) => void;
};

type CombatTutorialContextValue = CombatTutorialState & CombatTutorialActions;

const CombatTutorialStateContext = createContext<CombatTutorialState | null>(
  null,
);
const CombatTutorialActionsContext =
  createContext<CombatTutorialActions | null>(null);

export function CombatTutorialProvider({ children }: { children: ReactNode }) {
  const [highlightedControl, setHighlightedControl] = useState<string | null>(
    null,
  );

  const stateValue = useMemo(
    () => ({ highlightedControl }),
    [highlightedControl],
  );

  const actionsValue = useMemo(
    () => ({ setHighlightedControl }),
    [setHighlightedControl],
  );

  return (
    <CombatTutorialStateContext.Provider value={stateValue}>
      <CombatTutorialActionsContext.Provider value={actionsValue}>
        {children}
      </CombatTutorialActionsContext.Provider>
    </CombatTutorialStateContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCombatTutorialState() {
  const ctx = useContext(CombatTutorialStateContext);
  if (!ctx)
    throw new Error("useCombatTutorialState precisa do CombatTutorialProvider");
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCombatTutorialActions() {
  const ctx = useContext(CombatTutorialActionsContext);
  if (!ctx)
    throw new Error(
      "useCombatTutorialActions precisa do CombatTutorialProvider",
    );
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCombatTutorial(): CombatTutorialContextValue {
  const state = useCombatTutorialState();
  const actions = useCombatTutorialActions();
  return useMemo(() => ({ ...state, ...actions }), [state, actions]);
}
