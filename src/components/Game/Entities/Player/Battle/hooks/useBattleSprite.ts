import { useEffect, useState } from "react";

import {
  basicComboSpritePath,
  idleFrameSprite,
  playerAbilityPath,
  resolveBattleSprite,
  resolveDivergentFistSprite,
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
 * Sprites do Punho Divergente que já deram 404 nesta sessão. A pasta do
 * natsuki não cobre todo estado (não tem `jump.svg`, por exemplo), e um arquivo
 * removido depois do mapeamento não pode piscar a imagem quebrada a cada frame.
 * Guardar a falha evita repetir o 404; o fallback é o sprite normal do estado.
 */
const MISSING_DIVERGENT_FIST_SPRITES = new Set<string>();

/**
 * Estados do básico que continuam usando `divergentFist/` depois que o golpe
 * conectou. O dano sendo aplicado no próprio press (e não no fim da animação)
 * faz `divergentFistActive` cair antes do `punch.svg` aparecer; sem esta trava a
 * sequência `prePunch` → `punch` seria interrompida pelo sprite normal.
 */
const DIVERGENT_FIST_ATTACK_STATES: ReadonlySet<PlayerState> = new Set([
  "preAttack",
  "attack",
  "punch",
  "crit",
  "preKick",
  "kick",
  "blockAttack",
  "fallingAttack",
]);

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
  babidiToxicForm?: boolean;
  hakai?: boolean;
  sigiloPhase?: string;
  basicComboStep?: number;
  /** Punho Divergente do natsuki ativo: sprite de `habilities/divergentFist/`. */
  divergentFistActive?: boolean;
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
  basicComboStep,
  divergentFistActive = false,
}: UseBattleSpriteParams) {
  const resolvedState = resolveSpriteState(state);

  // Trava o sprite da habilidade até o fim da animação de ataque: vira true no
  // activation e só volta a false quando o personagem sai de um estado de
  // ataque — ou seja, depois que `prePunch` → `punch` já foi exibido. Um ataque
  // comum posterior não reativa a trava porque `divergentFistActive` está false.
  const [divergentFistSpriteOn, setDivergentFistSpriteOn] = useState(false);

  useEffect(() => {
    if (divergentFistActive) {
      setDivergentFistSpriteOn(true);
      return;
    }
    if (!DIVERGENT_FIST_ATTACK_STATES.has(state)) {
      setDivergentFistSpriteOn(false);
    }
  }, [divergentFistActive, state]);

  const useDivergentSprites = divergentFistActive || divergentFistSpriteOn;

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

  const toxicRequested =
    character === "babidi" && babidiToxicForm && !babidiMachineGamaControl;
  const toxicCandidate = toxicRequested ? toBabidiToxicSprite(baseSrc) : null;
  const toxicPlaceholder =
    toxicRequested &&
    (toxicCandidate === null || MISSING_TOXIC_SPRITES.has(toxicCandidate));
  if (toxicCandidate !== null && !toxicPlaceholder) {
    baseSrc = toxicCandidate;
  }

  // Punho Divergente: a pasta própria só é usada nos estados que têm arte.
  // Sem sprite mapeado (jump/falling/blocked…), `plainSrc` já é o fallback
  // normal da pasta do estado.
  const requestedDivergentSprite =
    character === "natsuki" && useDivergentSprites && !outroExpression
      ? resolveDivergentFistSprite(resolvedState)
      : null;
  const divergentCandidate =
    requestedDivergentSprite !== null &&
    !MISSING_DIVERGENT_FIST_SPRITES.has(requestedDivergentSprite)
      ? requestedDivergentSprite
      : null;
  if (divergentCandidate !== null) {
    baseSrc = divergentCandidate;
  }

  // Sequência idle do personagem (e forma):1 frame = parado, >1 = animado.
  const idleFrames = getIdleFrames(character, form);

  // O `divergentFist/` só tem `idle.svg` (sem idle2/idle3): animar a sequência
  // do personagem ali geraria 404 a cada ciclo. No sprite normal a animação
  // continua como antes.
  const animateIdle =
    state === "idle" && baseSrc !== divergentCandidate && idleFrames.length > 1;
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

  // O mesmo arquivo pode servir a estados diferentes (`walk`/`preWalk`,
  // `attack`/`punch`), então o estado também faz parte da chave do fallback.
  useEffect(() => {
    setErrorSrc(null);
  }, [baseSrc, resolvedState]);

  const src = errorSrc ?? idleFrameSprite(baseSrc, idleFrames, idleFrame);

  const handleSpriteError = () => {
    if (divergentCandidate !== null && baseSrc === divergentCandidate) {
      MISSING_DIVERGENT_FIST_SPRITES.add(divergentCandidate);
      // Volta exatamente ao sprite do estado atual — por exemplo `jump` cai em
      // `inFight/jump/jump.svg`, não no idle genérico.
      setErrorSrc(plainSrc);
      return;
    }

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
    toxicPlaceholder,
  };
}
