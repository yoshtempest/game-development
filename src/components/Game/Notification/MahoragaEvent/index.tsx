import { useMahoragaEvent } from "@/hooks/events/useMahoragaEvent";

/**
 * Componente sem UI que só mantém o relógio do evento do Mahoraga vivo para
 * disparar a notificação do sistema. Fica isolado (e não como hook direto no
 * `GameApp`) para o tick de 30s re-renderizar só ele, não o app inteiro.
 */
export function MahoragaEventNotifier() {
  useMahoragaEvent(true);
  return null;
}
