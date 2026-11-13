import { useEffect, useState } from "react";

import {
  idleFrameSprite,
  playerAbilityPath,
  resolveBattleSprite,
} from "@/utils/paths";
import { resolveSpriteState } from "@/gameRules/battle/playerStates";
import { getIdleFrames, IDLE_FRAME_MS } from "@/data/sprites/idleFrames";

import { resolvePlayerSprite } from "@/components/Game/Entities/Player/Battle/utils/resolvePlayerSprite";
import type { BabidiAttackVariant } from "@/utils/types/character/babidi/attack";

/**
 * Sprites do Modo Tóxico que já falharam ao carregar nesta sessão.
 *
 * A arte de `babidi/inFight/toxicForm/` ainda não existe para todo estado:
 * lembrar a falha evita um 404 (e um frame de imagem quebrada) a cada troca
 * de estado — depois da primeira falha o estado vai direto para o sprite
 * normal com o tint verde de placeholder. É por sessão de propósito: a arte
 * adicionada depois aparece no próximo reload, sem precisar de flag.
 */
const MISSING_TOXIC_SPRITES = new Set<string>();

/**
 * Caminho esperado do sprite do Modo Tóxico: a mesma árvore de `inFight/`
 * (`withGun/`, `withMissile/`, `landing.svg`…) espelhada sob
 * `inFight/toxicForm/`, para a arte nova entrar sem mudar código.
 */
function toBabidiToxicSprite(src: string): string | null {
  const marker = "/babidi/inFight/";
  if (!src.includes(marker)) return null;
  return src.replace(marker, `${marker}toxicForm/`);
}

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
  babidiToxicForm?: boolean;
  hakai?: boolean;
  sigiloPhase?: string;
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
  babidiToxicForm = false,
  hakai = false,
  sigiloPhase,
}: UseBattleSpriteParams) {
  const resolvedState = resolveSpriteState(state);

  let baseSrc = resolvePlayerSprite({
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

  const toxicRequested =
    character === "babidi" && babidiToxicForm && !babidiMachineGamaControl;
  const toxicCandidate = toxicRequested ? toBabidiToxicSprite(baseSrc) : null;
  const toxicPlaceholder =
    toxicRequested &&
    (toxicCandidate === null || MISSING_TOXIC_SPRITES.has(toxicCandidate));
  if (toxicCandidate !== null && !toxicPlaceholder) {
    baseSrc = toxicCandidate;
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
    if (toxicCandidate !== null && !toxicPlaceholder) {
      MISSING_TOXIC_SPRITES.add(toxicCandidate);
      setErrorSrc(
        resolvePlayerSprite({
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
        }),
      );
      return;
    }

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
    toxicPlaceholder,
  };
}
