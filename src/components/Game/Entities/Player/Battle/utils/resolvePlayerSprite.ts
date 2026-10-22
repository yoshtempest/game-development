import { resolveBattleSprite, playerPath, playerPathEmanuelHabilities } from "@/utils/paths";
import { resolveSpriteState } from "@/gameRules/battle/playerStates";

import { TRANSFORMATION_FRAMES } from "@/components/Game/Entities/Player/Battle/constants";
import type { LucauaAttackVariant } from "@/utils/types/character/lucaua/attack";

interface ResolvePlayerSpriteParams {
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

export function resolvePlayerSprite({
  character,
  state,
  weapon,
  form,
  transformationFrame,
  teleportSprite,
  outroExpression = null,
  lucauaAttackVariant,
  lucauaPortalLanding = false,
}: ResolvePlayerSpriteParams): string {
  const resolvedState = resolveSpriteState(state);

  // Fim da batalha: o sprite na arena vira o mesmo retrato que o BattleOutro
  // exibe (`expressions/victory|defeat.svg`). Vence qualquer outro override
  // porque, com o resultado definido, nada mais está em andamento.
  if (outroExpression) {
    return playerPath(`/${character}/expressions/${outroExpression}.svg`);
  }

  // Voo do portal do lucaua: sprite de decolagem enquanto o player atravessa
  // (ou cai de) um portal aéreo.
  if (lucauaPortalLanding && character === "lucaua") {
    return playerPath("/lucaua/inFight/landing.svg");
  }

  // Não trocar o sprite do Marcelo para `starting.svg` quando qualquer habilidade
  // é "preparada": o cliente pediu para manter o sprite base do personagem.

  if (form === "vastolordForm" && transformationFrame != null) {
    const frame = TRANSFORMATION_FRAMES[transformationFrame] ?? "screamOne";

    return playerPath(
      `/marcelo/inFight/vastolordForm/transformating/${frame}.svg`,
    );
  }

  if (teleportSprite && character === "emanuel") {
    return playerPathEmanuelHabilities(`/teleport/teleport.svg`);
  }

  return resolveBattleSprite(
    character,
    resolvedState,
    weapon,
    form,
    lucauaAttackVariant,
  );
}
