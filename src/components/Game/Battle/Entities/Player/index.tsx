import { PlayerBattle } from "@/components/Game/Entities/Player/Battle";
import type { BlinkVisual } from "@/hooks/battle/player/characters/natsuki/useBlinkAnimation";
import type {
  BabidiPortalCross,
  BabidiShieldSide,
  BabidiShieldSides,
} from "@/utils/types/character/babidi";
import type { BabidiAttackVariant } from "@/utils/types/character/babidi/attack";

type Props = {
  player: Player;
  PLAYER_SIZE: number;
  weapon?: YvelWeapon;
  grabFlipped?: boolean;
  form?: "vastolordForm";
  /** Quadro da transformação do marshadow (0=screamOne … 3=transformated) ou null. */
  transformationFrame?: number | null;
  blinkVisual?: BlinkVisual | null;
  /** Ematron segurando a instância: troca o sprite para teleport.svg. */
  teleportSprite?: boolean;
  /** Durante o specialBackground: troca o sprite para preAtomic.svg. */
  preAtomic?: boolean;
  /** Vitória/derrota: troca o sprite para expressions/<tipo>.svg (battleOutro). */
  outroExpression?: "victory" | "defeat" | null;
  /** Halo.svg acima do sprite durante preparing/finalizating do "I Am Atomic". */
  atomicHalo?: boolean;
  /** Flash no sprite quando a explosion.svg da habilidade aparece. */
  atomicFlash?: boolean;
  /** Blink do teleporte da Expansão de Domínio do marshadow. */
  mugetsuBlink?: "out" | "in" | null;
  /** Pose de mão do sprite do ataque básico do babidi. */
  babidiAttackVariant?: BabidiAttackVariant;
  /** Nonces dos shields de bloqueio do babidi por lado (`0` = inativo). */
  babidiShieldSides?: BabidiShieldSides;
  /** Encerra o shield de um lado quando ele termina o fade-out. */
  onBabidiShieldEnd?: (side: BabidiShieldSide, nonce: number) => void;
  /** Player saindo de um portal do babidi (voo/decolagem). */
  babidiPortalLanding?: boolean;
  /** Travessia em andamento por um portal terrestre (sprite dividido). */
  babidiPortalCross?: BabidiPortalCross | null;
  hakai?: boolean
};

export function Player({
  player,
  PLAYER_SIZE,
  weapon,
  grabFlipped = false,
  form,
  transformationFrame = null,
  blinkVisual = null,
  teleportSprite = false,
  preAtomic = false,
  outroExpression = null,
  atomicHalo = false,
  atomicFlash = false,
  mugetsuBlink = null,
  babidiAttackVariant,
  babidiShieldSides,
  onBabidiShieldEnd,
  babidiPortalLanding = false,
  babidiPortalCross = null,
  hakai = false,
}: Props) {
  const blinkSilhouette =
    player.character === "natsuki" && blinkVisual
      ? blinkVisual.teleported
        ? "white"
        : "black"
      : null;

  return (
    <PlayerBattle
      character={player.character}
      x={player.x}
      y={player.y}
      PLAYER_SIZE={PLAYER_SIZE}
      state={player.state}
      direction={player.battleDirection}
      weapon={weapon}
      grabbedUntil={player.grabbedUntil}
      grabFlipped={grabFlipped}
      form={form}
      transformationFrame={transformationFrame}
      blinkSilhouette={blinkSilhouette}
      teleportSprite={teleportSprite}
      preAtomic={preAtomic}
      outroExpression={outroExpression}
      atomicHalo={atomicHalo}
      atomicFlash={atomicFlash}
      mugetsuBlink={mugetsuBlink}
      babidiAttackVariant={babidiAttackVariant}
      babidiShieldSides={babidiShieldSides}
      onBabidiShieldEnd={onBabidiShieldEnd}
      babidiPortalLanding={babidiPortalLanding}
      babidiPortalCross={babidiPortalCross}
      levelUpParticles
      hakai={hakai}
    />
  );
}
