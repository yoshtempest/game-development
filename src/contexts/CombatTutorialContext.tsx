import { createContext, useContext, useState, type ReactNode } from "react";

type CombatTutorialContextValue = {
  highlightedControl: string | null;
  setHighlightedControl: (value: string | null) => void;
};

const CombatTutorialContext = createContext<CombatTutorialContextValue>({
  highlightedControl: null,
  setHighlightedControl: () => {},
});

export function CombatTutorialProvider({ children }: { children: ReactNode }) {
  const [highlightedControl, setHighlightedControl] = useState<string | null>(
    null,
  );

  return (
    <CombatTutorialContext.Provider
      value={{ highlightedControl, setHighlightedControl }}
    >
      {children}
    </CombatTutorialContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCombatTutorial() {
  return useContext(CombatTutorialContext);
}