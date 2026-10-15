import { PlayerBattle } from "@/components/Game/Entities/Player/Battle";
import type { BlinkVisual } from "@/hooks/battle/player/characters/natsuki/useBlinkAnimation";
import type {
  LucauaAttackVariant,
  LucauaShieldSide,
  LucauaShieldSides,
} from "@/utils/types/character/lucaua";

type Props = {
  player: Player;
  PLAYER_SIZE: number;
  weapon?: LucasWeapon;
  grabFlipped?: boolean;
  form?: "vastolordForm";
  /** Quadro da transformação do marcelo (0=screamOne … 3=transformated) ou null. */
  transformationFrame?: number | null;
  blinkVisual?: BlinkVisual | null;
  /** Emanuel segurando a instância: troca o sprite para teleport.svg. */
  teleportSprite?: boolean;
  /** Durante o specialBackground: troca o sprite para preAtomic.svg. */
  preAtomic?: boolean;
  /** Vitória/derrota: troca o sprite para expressions/<tipo>.svg (battleOutro). */
  outroExpression?: "victory" | "defeat" | null;
  /** Halo.svg acima do sprite durante preparing/finalizating do "I Am Atomic". */
  atomicHalo?: boolean;
  /** Flash no sprite quando a explosion.svg da habilidade aparece. */
  atomicFlash?: boolean;
  /** Blink do teleporte da Expansão de Domínio do marcelo. */
  mugetsuBlink?: "out" | "in" | null;
  /** Pose de mão do sprite do ataque básico do lucaua. */
  lucauaAttackVariant?: LucauaAttackVariant;
  /** Nonces dos shields de bloqueio do lucaua por lado (`0` = inativo). */
  lucauaShieldSides?: LucauaShieldSides;
  /** Encerra o shield de um lado quando ele termina o fade-out. */
  onLucauaShieldEnd?: (side: LucauaShieldSide, nonce: number) => void;
  /** Player saindo de um portal do lucaua (voo/decolagem). */
  lucauaPortalLanding?: boolean;
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
  lucauaAttackVariant,
  lucauaShieldSides,
  onLucauaShieldEnd,
  lucauaPortalLanding = false,
}: Props) {
  const blinkSilhouette =
    player.character === "riquelme" && blinkVisual
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
      lucauaAttackVariant={lucauaAttackVariant}
      lucauaShieldSides={lucauaShieldSides}
      onLucauaShieldEnd={onLucauaShieldEnd}
      lucauaPortalLanding={lucauaPortalLanding}
      levelUpParticles
    />
  );
}
