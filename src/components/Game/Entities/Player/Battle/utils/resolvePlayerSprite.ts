import {
  resolveBattleSprite,
  playerPath,
  playerPathEmatronHabilities,
} from "@/utils/paths";
import { resolveSpriteState } from "@/gameRules/battle/playerStates";

import { TRANSFORMATION_FRAMES } from "@/components/Game/Entities/Player/Battle/constants";
import type { BabidiAttackVariant } from "@/utils/types/character/babidi/attack";

interface ResolvePlayerSpriteParams {
  character: CharacterId;
  state: PlayerState;
  weapon?: YvelWeapon;
  form?: "vastolordForm";
  transformationFrame?: number | null;
  teleportSprite: boolean;
  hakai?: boolean;
  preAtomic: boolean;
  outroExpression?: "victory" | "defeat" | null;
  babidiAttackVariant?: BabidiAttackVariant;
  /** Player saindo de um portal do babidi (voo/decolagem). */
  babidiPortalLanding?: boolean;
}

export function resolvePlayerSprite({
  character,
  state,
  weapon,
  form,
  transformationFrame,
  teleportSprite,
  outroExpression = null,
  babidiAttackVariant,
  babidiPortalLanding = false,
  hakai = false,
}: ResolvePlayerSpriteParams): string {
  const resolvedState = resolveSpriteState(state);

  // Fim da batalha: o sprite na arena vira o mesmo retrato que o BattleOutro
  // exibe (`expressions/victory|defeat.svg`). Vence qualquer outro override
  // porque, com o resultado definido, nada mais está em andamento.
  if (outroExpression) {
    return playerPath(`/${character}/expressions/${outroExpression}.svg`);
  }

  // Voo do portal do babidi: sprite de decolagem enquanto o player atravessa
  // (ou cai de) um portal aéreo.
  if (babidiPortalLanding && character === "babidi") {
    return playerPath("/babidi/inFight/landing.svg");
  }

  // Não trocar o sprite do Marshadow para `starting.svg` quando qualquer habilidade
  // é "preparada": o cliente pediu para manter o sprite base do personagem.

  if (form === "vastolordForm" && transformationFrame != null) {
    const frame = TRANSFORMATION_FRAMES[transformationFrame] ?? "screamOne";

    return playerPath(
      `/marshadow/inFight/vastolordForm/transformating/${frame}.svg`,
    );
  }

  if (character === "ematron") {
    if (teleportSprite) {
      return playerPathEmatronHabilities(`/teleport/teleport.svg`);
    }
    if (hakai) {
      return playerPathEmatronHabilities("/domainExpansion/hakai.svg");
    }
  }

  return resolveBattleSprite(
    character,
    resolvedState,
    weapon,
    form,
    babidiAttackVariant,
  );
}
