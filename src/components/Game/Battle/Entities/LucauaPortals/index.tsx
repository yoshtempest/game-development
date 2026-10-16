import { lucauaPortalPath } from "@/utils/paths";
import { LucauaPortalConstants } from "@/data/characters/lucaua/lucaua";
import styles from "./styles.module.css";

import type {
  LucauaPortal,
  LucauaPortalGhost,
  LucauaPortalKind,
} from "@/utils/types/character/lucaua";

type Props = {
  portals: LucauaPortal[];
  /** Fantasma do posicionamento (semi-transparente) ou null. */
  ghost: LucauaPortalGhost | null;
  battleScaleX: number;
  battleScaleY: number;
};

/**
 * Ajuste do sprite em relação à âncora (o ponto `x/y` em que a entidade
 * atravessa). O portal deitado sobe um pouco mais para não "afundar" na linha
 * do chão; o frontal é um batente de pé — a **base** da arte fica na âncora,
 * a mesma linha dos pés do player (o portal não pode sair centralizado no
 * chão, senão a entidade emerge na metade da imagem); o aéreo fica centrado,
 * igual à zona de travessia.
 */
const ANCHOR_TRANSFORM: Record<LucauaPortalKind, string> = {
  ground: "translate(-50%, -62%)",
  default: "translate(-50%, -100%)",
  air: "translate(-50%, -50%)",
};

/**
 * Portais do lucaua no mapa (fixos e o fantasma do posicionamento). A âncora
 * `x/y` é o ponto em que a entidade atravessa — o mesmo referencial que a zona
 * de travessia do hook usa.
 */
export function LucauaPortals({
  portals,
  ghost,
  battleScaleX,
  battleScaleY,
}: Props) {
  return (
    <>
      {portals.map((portal) => (
        <img
          key={portal.id}
          className={styles.portal}
          src={lucauaPortalPath(portal.kind)}
          alt="Portal do lucaua"
          style={{
            left: portal.x * battleScaleX,
            top: portal.y * battleScaleY,
            width: LucauaPortalConstants.SPRITE_WIDTH,
            transform: ANCHOR_TRANSFORM[portal.kind],
            opacity: portal.phase === "flying" ? 0.85 : 1,
          }}
        />
      ))}

      {ghost && (
        <img
          className={`${styles.portal} ${styles.ghost}`}
          src={lucauaPortalPath(ghost.kind)}
          alt="Portal do lucaua (posicionando)"
          style={{
            left: ghost.x * battleScaleX,
            top: ghost.y * battleScaleY,
            width: LucauaPortalConstants.SPRITE_WIDTH,
            transform: ANCHOR_TRANSFORM[ghost.kind],
          }}
        />
      )}
    </>
  );
}
