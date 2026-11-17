import { asset } from "@/utils/paths";

/**
 * Mostra uma notificação do sistema (celular/desktop) gerada pelo próprio app,
 * sem servidor de push.
 *
 * Passa pelo service worker quando há um registrado: no Android a API
 * `new Notification()` é proibida dentro de página e só
 * `registration.showNotification` funciona. Sem permissão ou sem suporte, não
 * faz nada — a notificação é um aviso extra, nunca o único caminho para o
 * jogador descobrir o evento.
 *
 * Limitação: só dispara com o app aberto (inclusive em segundo plano). Avisar
 * com o app fechado exige push do `server/`, que é opcional.
 */
export async function showLocalNotification(
  title: string,
  body: string,
): Promise<void> {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
  if (Notification.permission !== "granted") return;

  const options: NotificationOptions = {
    body,
    icon: asset("pwa-192x192.png"),
    badge: asset("pwa-192x192.png"),
  };

  const registration =
    "serviceWorker" in navigator
      ? await navigator.serviceWorker.getRegistration()
      : undefined;

  if (registration) {
    await registration.showNotification(title, options);
    return;
  }
  new Notification(title, options);
}
