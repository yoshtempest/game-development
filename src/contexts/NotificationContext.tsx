import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useUpdate } from "@/contexts/UpdateContext";

import {
  LAST_PLAYED_KEY,
  LAST_REMINDER_KEY,
  NOTIFICATIONS_ENABLED_KEY,
} from "@/data/storageKeys";
import {
  isNotificationSupported,
  PLAY_REMINDER_HOURS,
  readTimestamp,
  REMINDER_CHECK_INTERVAL_MS,
  showLocalNotification,
  writeTimestamp,
} from "@/utils/notifications";

export type NotificationPermissionState =
  NotificationPermission | "unsupported";

type NotificationContextType = {
  enabled: boolean;
  permission: NotificationPermissionState;
  toggleNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType | null>(
  null,
);

const REMINDER_MS = PLAY_REMINDER_HOURS * 60 * 60 * 1000;

function readEnabled(): boolean {
  try {
    return localStorage.getItem(NOTIFICATIONS_ENABLED_KEY) === "1";
  } catch {
    return false;
  }
}

function writeEnabled(value: boolean): void {
  try {
    localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, value ? "1" : "0");
  } catch {
    return;
  }
}

function readPermission(): NotificationPermissionState {
  return isNotificationSupported() ? Notification.permission : "unsupported";
}

/**
 * Notificações locais do PWA (lembrete de jogar e aviso de atualização).
 *
 * Não existe servidor de push, então nada chega com o app fechado: o lembrete
 * só dispara enquanto o app segue aberto em segundo plano (aba oculta / PWA
 * minimizado). Por isso o "último jogo" é carimbado sempre que a página fica
 * visível, e um intervalo checa — só com a página oculta, para nunca avisar
 * quem está jogando — se já passaram `PLAY_REMINDER_HOURS`. `LAST_REMINDER_KEY`
 * garante um lembrete por período de ausência.
 *
 * O aviso de atualização reaproveita o `status` do `UpdateProvider` (precisa
 * estar dentro dele) e dispara uma vez por sessão quando um SW novo fica
 * esperando, já que o `applyUpdate` é manual e o jogador pode não abrir o menu.
 *
 * Tudo é opt-in: sem `enabled` e permissão `granted`, nada é mostrado.
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState<boolean>(readEnabled);
  const [permission, setPermission] =
    useState<NotificationPermissionState>(readPermission);
  const { status } = useUpdate();
  const notifiedUpdateRef = useRef(false);

  const active = enabled && permission === "granted";

  useEffect(() => {
    function stampIfVisible() {
      if (document.visibilityState === "visible") {
        writeTimestamp(LAST_PLAYED_KEY, Date.now());
      }
    }

    stampIfVisible();
    document.addEventListener("visibilitychange", stampIfVisible);
    return () =>
      document.removeEventListener("visibilitychange", stampIfVisible);
  }, []);

  useEffect(() => {
    if (!active) return;

    function checkReminder() {
      if (document.visibilityState !== "hidden") return;
      const lastPlayed = readTimestamp(LAST_PLAYED_KEY);
      if (lastPlayed === null) return;
      const now = Date.now();
      if (now - lastPlayed < REMINDER_MS) return;
      const lastReminder = readTimestamp(LAST_REMINDER_KEY);
      if (lastReminder !== null && lastReminder > lastPlayed) return;

      writeTimestamp(LAST_REMINDER_KEY, now);
      void showLocalNotification(
        "Jomasio Adventures",
        "Sentimos sua falta! Volte para continuar sua aventura.",
        "play-reminder",
      );
    }

    const interval = window.setInterval(
      checkReminder,
      REMINDER_CHECK_INTERVAL_MS,
    );
    document.addEventListener("visibilitychange", checkReminder);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", checkReminder);
    };
  }, [active]);

  useEffect(() => {
    if (!active || status !== "available" || notifiedUpdateRef.current) {
      return;
    }
    notifiedUpdateRef.current = true;
    void showLocalNotification(
      "Nova versão disponível",
      "Abra Configurações e toque em \"Atualizar agora\" para receber as novidades.",
      "app-update",
    );
  }, [active, status]);

  const toggleNotifications = useCallback(() => {
    if (!isNotificationSupported()) {
      setPermission("unsupported");
      return;
    }

    if (enabled) {
      setEnabled(false);
      writeEnabled(false);
      return;
    }

    if (Notification.permission === "granted") {
      setPermission("granted");
      setEnabled(true);
      writeEnabled(true);
      return;
    }

    if (Notification.permission === "denied") {
      setPermission("denied");
      return;
    }

    void Notification.requestPermission()
      .then((result) => {
        setPermission(result);
        const granted = result === "granted";
        setEnabled(granted);
        writeEnabled(granted);
      })
      .catch(() => setPermission(readPermission()));
  }, [enabled]);

  const value = useMemo(
    () => ({ enabled: active, permission, toggleNotifications }),
    [active, permission, toggleNotifications],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications precisa do NotificationProvider");
  }
  return ctx;
}
