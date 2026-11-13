import { asset } from "@/utils/paths";

/** Horas sem jogar até o lembrete local ser disparado. */
export const PLAY_REMINDER_HOURS = 24;

/** Intervalo entre checagens enquanto o app segue aberto em segundo plano. */
export const REMINDER_CHECK_INTERVAL_MS = 15 * 60 * 1000;

/**
 * Indica se o navegador expõe a Notification API.
 *
 * Safari em iOS só a expõe com o PWA instalado na tela inicial, e WebViews
 * costumam não ter — por isso a checagem é em tempo de execução e a UI mostra
 * "indisponível" em vez de falhar.
 */
export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/**
 * Mostra uma notificação local, sem servidor de push.
 *
 * Prefere `registration.showNotification` porque no Chrome/Android o
 * construtor `new Notification` lança `TypeError` quando há service worker
 * controlando a página; o construtor fica de fallback para quem não tem SW
 * registrado (dev, navegador sem SW). Erros são engolidos: uma notificação
 * perdida não pode derrubar o jogo.
 *
 * @param title - Título da notificação.
 * @param body - Texto do corpo.
 * @param tag - Substitui a notificação anterior de mesma tag em vez de empilhar.
 */
export async function showLocalNotification(
  title: string,
  body: string,
  tag: string,
): Promise<void> {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return;
  }

  const options: NotificationOptions = {
    body,
    tag,
    icon: asset("pwa-192x192.png"),
  };

  try {
    const registration =
      "serviceWorker" in navigator
        ? await navigator.serviceWorker.getRegistration()
        : undefined;

    if (registration) {
      await registration.showNotification(title, options);
      return;
    }

    new Notification(title, options);
  } catch {
    return;
  }
}

/**
 * Lê um timestamp numérico do `localStorage`.
 *
 * @returns O valor salvo, ou `null` quando ausente, inválido ou com storage bloqueado.
 */
export function readTimestamp(key: string): number | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

/** Grava um timestamp no `localStorage`; storage bloqueado só perde o lembrete. */
export function writeTimestamp(key: string, value: number): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    return;
  }
}
