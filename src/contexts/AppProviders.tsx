import { type ReactNode } from "react";
import { TransitionProvider } from "@/contexts/Transition/TransitionContext";
import { PWAProvider } from "@/contexts/PWAContext";
import { UpdateProvider } from "@/contexts/UpdateContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { OnlineProvider } from "@/contexts/OnlineContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <TransitionProvider>
        <PWAProvider>
          <UpdateProvider>
            <OnlineProvider>{children}</OnlineProvider>
          </UpdateProvider>
        </PWAProvider>
      </TransitionProvider>
    </AuthProvider>
  );
}
