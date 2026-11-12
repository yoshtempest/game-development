import { useProfessionBadge } from "@/contexts/ProfessionBadgeContext";
import styles from "./styles.module.css";

/**
 * Badges de profissão que sobem acima da cabeça do jogador: um ícone por
 * ação de profissão concluída (minerar, lenhar, ...).
 *
 * Monta dentro da caixa posicionada do sprite do jogador (ver
 * `components/Game/Entities/Player`) — por isso só precisa centralizar no
 * topo da caixa, sem repetir a conta de grid/TILE_SIZE/altura.
 */
export function ProfessionBadge() {
  const { badges } = useProfessionBadge();

  if (badges.length === 0) return null;

  return (
    <>
      {badges.map((badge) => (
        <img
          loading="lazy"
          decoding="async"
          key={badge.id}
          src={badge.src}
          alt=""
          className={styles.badge}
        />
      ))}
    </>
  );
}
