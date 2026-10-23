import { type ReactNode } from "react";
import { TransitionProvider } from "@/contexts/Transition/TransitionContext";
import { PWAProvider } from "@/contexts/PWAContext";
import { UpdateProvider } from "@/contexts/UpdateContext";
import { AuthProvider } from "@/contexts/AuthContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <TransitionProvider>
        <PWAProvider>
          <UpdateProvider>{children}</UpdateProvider>
        </PWAProvider>
      </TransitionProvider>
    </AuthProvider>
  );
}
