import { type ReactNode } from "react";
import { TransitionProvider } from "@/contexts/Transition/TransitionContext";
import { PWAProvider } from "@/contexts/PWAContext";
import { UpdateProvider } from "@/contexts/UpdateContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { OnlineProvider } from "@/contexts/OnlineContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <TransitionProvider>
        <PWAProvider>
          <UpdateProvider>
            <NotificationProvider>
              <OnlineProvider>{children}</OnlineProvider>
            </NotificationProvider>
          </UpdateProvider>
        </PWAProvider>
      </TransitionProvider>
    </AuthProvider>
  );
}
