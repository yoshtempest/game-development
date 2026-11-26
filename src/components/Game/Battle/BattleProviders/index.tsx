import type { ReactNode } from "react";
import { BattleInfoProvider } from "@/contexts/BattleInfoContext";
import { BattleManaProvider } from "@/contexts/BattleManaContext";
import { BattleHealthProvider } from "@/contexts/BattleHealthContext";

export function BattleProviders({ children }: { children: ReactNode }) {
  return (
    <BattleInfoProvider>
      <BattleManaProvider>
        <BattleHealthProvider>{children}</BattleHealthProvider>
      </BattleManaProvider>
    </BattleInfoProvider>
  );
}
