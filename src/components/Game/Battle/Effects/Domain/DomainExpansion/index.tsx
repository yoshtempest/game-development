import { playerPathMarshadowHabilities } from "@/utils/paths";
import { ProjectileConstants } from "@/data/projectile";
import type { MugetsuSweep } from "@/utils/types/battle/mugetsu";

type Props = {
  sweep: MugetsuSweep | null;
  battleScaleX: number;
  battleScaleY: number;
};

/**
 * Largura renderizada do mugetsuEffect mantendo o aspect 500x333 do sprite:
 * a instância cobre a altura tuda do mapa (600px lógicos) e, proporcional,
 * boa parte da largura — a frente da varredura fica no centro da imagem.
 */
const MUGETSU_EFFECT_WIDTH = (500 / 333) * ProjectileConstants.MAP_HEIGHT;

/**
 * Instância do mugetsuEffect da Expansão de Domínio: imagem ancorada na
 * frente da varredura (sweep.x), cobrindo toda a altura do mapa e varrendo de
 * uma ponta à outra enquanto o hook move o sweep.x.
 */
export function DomainExpansionEffects({
  sweep,
  battleScaleX,
  battleScaleY,
}: Props) {
  if (!sweep) return null;

  const width = MUGETSU_EFFECT_WIDTH * battleScaleX;
  const height = ProjectileConstants.MAP_HEIGHT * battleScaleY;
  const left = (sweep.x - MUGETSU_EFFECT_WIDTH / 2) * battleScaleX;

  return (
    <img
      src={playerPathMarshadowHabilities("/domainExpansion/mugetsuEffect.svg")}
      alt=""
      draggable={false}
      style={{
        position: "absolute",
        left,
        top: 0,
        width,
        height,
        objectFit: "fill",
        zIndex: 5,
        pointerEvents: "none",
      }}
    />
  );
}
