import { useEffect, useState } from "react";

import {
  basicComboSpritePath,
  idleFrameSprite,
  playerAbilityPath,
  resolveBattleSprite,
} from "@/utils/paths";
import { resolveSpriteState } from "@/gameRules/battle/playerStates";
import {
  getBasicComboStep,
  usesBasicCombo,
} from "@/gameRules/battle/basicCombo";
import { getIdleFrames, IDLE_FRAME_MS } from "@/data/sprites/idleFrames";

import { resolvePlayerSprite } from "@/components/Game/Entities/Player/Battle/utils/resolvePlayerSprite";
import type { BabidiAttackVariant } from "@/utils/types/character/babidi/attack";

/**
 * Sprites de postura do combo básico que já deram 404. Os assets `attackN.svg`
 * ainda não existem para a maioria dos personagens (issue #380); sem este
 * cache cada golpe tentaria o arquivo de novo e piscaria a imagem quebrada
 * antes do fallback. É global ao módulo porque a ausência do arquivo não muda
 * durante a sessão.
 */
const missingComboSprites = new Set<string>();

interface UseBattleSpriteParams {
  character: CharacterId;
  state: PlayerState;
  weapon?: string;
  form?: "vastolordForm";
  transformationFrame?: number | null;
  teleportSprite: boolean;
  preAtomic: boolean;
  outroExpression?: "victory" | "defeat" | null;
  babidiAttackVariant?: BabidiAttackVariant;
  babidiMachineGamaControl?: boolean;
  hakai?: boolean;
  sigiloPhase?: string;
  basicComboStep?: number;
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
  babidiAttackVariant,
  babidiMachineGamaControl = false,
  hakai = false,
  sigiloPhase,
  basicComboStep,
}: UseBattleSpriteParams) {
  const resolvedState = resolveSpriteState(state);

  const plainSrc = resolvePlayerSprite({
    character,
    state,
    weapon,
    form,
    transformationFrame,
    teleportSprite,
    preAtomic,
    outroExpression,
    babidiAttackVariant,
    hakai,
    sigiloPhase,
  });

  const comboSrc =
    state === "attack" &&
    basicComboStep != null &&
    !outroExpression &&
    usesBasicCombo(character)
      ? basicComboSpritePath(
          plainSrc,
          getBasicComboStep(basicComboStep).sprite,
        )
      : null;
  const usableComboSrc =
    comboSrc && !missingComboSprites.has(comboSrc) ? comboSrc : null;

  let baseSrc = usableComboSrc ?? plainSrc;

  if (character === "babidi" && babidiMachineGamaControl) {
    const mgState = resolvedState;
    const file =
      mgState === "idleCrounched"
        ? "idleCrounched.svg"
        : mgState === "walkCrounched"
          ? "walkCrounched.svg"
          : mgState === "walk"
            ? "walk.svg"
            : mgState === "run" || mgState === "preRun"
              ? "run.svg"
              : mgState === "preJump"
                ? "preJump.svg"
                : mgState === "jump"
                  ? "jump.svg"
                  : mgState === "falling"
                    ? "falling.svg"
                    : mgState === "preAttack"
                      ? "preAttack.svg"
                      : mgState === "attack" ||
                          mgState === "ability" ||
                          mgState === "preAbility"
                        ? "attack.svg"
                        : "idle.svg";
    baseSrc = playerAbilityPath(
      "babidi",
      "domainExpansion",
      `machineGama/${file}`,
    );
  }

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
          babidiAttackVariant,
          sigiloPhase,
        }),
      );
      return;
    }

    if (usableComboSrc && baseSrc === usableComboSrc) {
      missingComboSprites.add(usableComboSrc);
      setErrorSrc(plainSrc);
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

    setErrorSrc(
      resolveBattleSprite(
        character,
        fallbackState,
        weapon,
        form,
        babidiAttackVariant,
        sigiloPhase,
      ),
    );
  };

  return {
    src,
    handleSpriteError,
    resolvedState,
  };
}
