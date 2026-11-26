import styles from "./styles.module.css";
import { Download, RefreshCw } from "lucide-react";
import { useUpdate } from "@/contexts/UpdateContext";

/**
 * Button that checks for a new service worker and, once one is waiting, applies
 * it.
 *
 * The two actions share a button because they are one flow from the player's
 * side. `applyUpdate` reloads the page, so it is only ever reachable from an
 * explicit click — the app no longer swaps workers underneath a running battle.
 */
export function UpdateButton() {
  const { status, checkForUpdate, applyUpdate } = useUpdate();

  const isAvailable = status === "available";
  const isChecking = status === "checking";

  const label = isChecking
    ? "Verificando..."
    : isAvailable
      ? "Atualizar agora"
      : status === "error"
        ? "Erro ao verificar"
        : "Verificar atualização";

  return (
    <button
      type="button"
      className="navbarContainerRow"
      onClick={isAvailable ? applyUpdate : checkForUpdate}
      disabled={isChecking}
    >
      {isAvailable ? (
        <Download size={14} />
      ) : (
        <RefreshCw
          size={14}
          className={isChecking ? styles.spinning : undefined}
        />
      )}
      {label}
    </button>
  );
}
