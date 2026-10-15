import { useEffect, useState } from "react";

import { idleFrameSprite, resolveBattleSprite } from "@/utils/paths";
import { resolveSpriteState } from "@/gameRules/battle/playerStates";
import { getIdleFrames, IDLE_FRAME_MS } from "@/data/sprites/idleFrames";

import { resolvePlayerSprite } from "@/components/Game/Entities/Player/Battle/utils/resolvePlayerSprite";
import type { LucauaAttackVariant } from "@/utils/types/character/lucaua";

interface UseBattleSpriteParams {
  character: CharacterId;
  state: PlayerState;
  weapon?: LucasWeapon;
  form?: "vastolordForm";
  transformationFrame?: number | null;
  teleportSprite: boolean;
  preAtomic: boolean;
  outroExpression?: "victory" | "defeat" | null;
  lucauaAttackVariant?: LucauaAttackVariant;
  /** Player saindo de um portal do lucaua (voo/decolagem). */
  lucauaPortalLanding?: boolean;
}

export function useBattleSprite({
  character,
  state,
  weapon,
  form,
  transformationFrame,
  teleportSprite,
  preAtomic,
  outroExpression = null,
  lucauaAttackVariant,
  lucauaPortalLanding = false,
}: UseBattleSpriteParams) {
  const resolvedState = resolveSpriteState(state);

  const baseSrc = resolvePlayerSprite({
    character,
    state,
    weapon,
    form,
    transformationFrame,
    teleportSprite,
    preAtomic,
    outroExpression,
    lucauaAttackVariant,
    lucauaPortalLanding,
  });

  // Sequência idle do personagem (e forma):1 frame = parado, >1 = animado.
  const idleFrames = getIdleFrames(character, form);

  // Só o idle "verdadeiro" anima: agachado (`idleCrounched`), carga, ataque e
  // qualquer outro estado usam o sprite base como antes da animação existir.
  const animateIdle = state === "idle" && idleFrames.length > 1;
  const [idleFrame, setIdleFrame] = useState(0);

  useEffect(() => {
    if (!animateIdle) {
      setIdleFrame(0);
      return;
    }

    const timer = setInterval(() => {
      setIdleFrame((current) => (current + 1) % idleFrames.length);
    }, IDLE_FRAME_MS);

    return () => clearInterval(timer);
  }, [animateIdle, idleFrames]);

  // Erro de sprite cai num estado "seguro" (run/jump) sem interromper o loop:
  // o fallback vira um src próprio, não substitui o `baseSrc` que o effect
  // monitora para limpar o estado quando o estado do personagem muda.
  const [errorSrc, setErrorSrc] = useState<string | null>(null);

  useEffect(() => {
    setErrorSrc(null);
  }, [baseSrc]);

  const src = errorSrc ?? idleFrameSprite(baseSrc, idleFrames, idleFrame);

  const handleSpriteError = () => {
    // Personagens sem `expressions/victory|defeat.svg` quebrariam a imagem na
    // arena; nesse caso volta para o sprite normal da batalha (o BattleOutro
    // segue inalterado, com o mesmo retrato que falhar nele).
    if (outroExpression) {
      setErrorSrc(
        resolvePlayerSprite({
          character,
          state,
          weapon,
          form,
          transformationFrame,
          teleportSprite,
          preAtomic,
          outroExpression: null,
          lucauaAttackVariant,
        }),
      );
      return;
    }

    const fallbackState =
      resolvedState === "preRun"
        ? "run"
        : resolvedState === "preJump"
          ? "jump"
          : null;

    if (!fallbackState) {
      return;
    }

    setErrorSrc(resolveBattleSprite(character, fallbackState, weapon, form, lucauaAttackVariant));
  };

  return {
    src,
    handleSpriteError,
    resolvedState,
  };
}
