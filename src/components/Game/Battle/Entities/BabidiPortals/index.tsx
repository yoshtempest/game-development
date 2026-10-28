import { babidiPortalPath } from "@/utils/paths";
import { BabidiPortalConstants } from "@/data/characters/babidi";
import styles from "./styles.module.css";

import type {
  BabidiPortal,
  BabidiPortalGhost,
  BabidiPortalKind,
} from "@/utils/types/character/babidi";

type Props = {
  portals: BabidiPortal[];
  /** Fantasma do posicionamento (semi-transparente) ou null. */
  ghost: BabidiPortalGhost | null;
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
const ANCHOR_TRANSFORM: Record<BabidiPortalKind, string> = {
  ground: "translate(-50%, -62%)",
  default: "translate(-50%, -100%)",
  air: "translate(-50%, -200%)",
};

/**
 * Portais do babidi no mapa (fixos e o fantasma do posicionamento). A âncora
 * `x/y` é o ponto em que a entidade atravessa — o mesmo referencial que a zona
 * de travessia do hook usa.
 *
 * O `transform` de âncora fica no **invólucro** e o giro (`scaleY`) no sprite
 * interno: se fossem o mesmo elemento, o `scaleY(-1)` também espelharia o
 * deslocamento do `translate` e o portal "andaria" a cada flip. Separados, o
 * giro espelha só o conteúdo, dentro da mesma caixa.
 */
export function BabidiPortals({
  portals,
  ghost,
  battleScaleX,
  battleScaleY,
}: Props) {
  return (
    <>
      {portals.map((portal) => (
        <span
          key={portal.id}
          className={styles.portal}
          style={{
            left: portal.x * battleScaleX,
            top: portal.y * battleScaleY,
            width: BabidiPortalConstants.SPRITE_WIDTH,
            transform: ANCHOR_TRANSFORM[portal.kind],
            opacity: portal.phase === "flying" ? 0.85 : 1,
          }}
        >
          <img
            className={styles.sprite}
            src={babidiPortalPath(portal.kind)}
            alt="Portal do babidi"
          />
        </span>
      ))}

      {ghost && (
        <span
          className={`${styles.portal} ${styles.ghost}`}
          style={{
            left: ghost.x * battleScaleX,
            top: ghost.y * battleScaleY,
            width: BabidiPortalConstants.SPRITE_WIDTH,
            transform: ANCHOR_TRANSFORM[ghost.kind],
          }}
        >
          <img
            className={styles.sprite}
            src={babidiPortalPath(ghost.kind)}
            alt="Portal do babidi (posicionando)"
          />
        </span>
      )}
    </>
  );
}
