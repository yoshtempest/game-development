import type { RefObject } from "react";
import type { useBattleRefs } from "@/hooks/battle/utilities/useRefs";
import type { useBattleStageSetup } from "@/hooks/battle/useBattleStageSetup";
import type { useBattleSystem } from "@/hooks/battle/main/battleSystem/useSystem";
import type { useNpcAI } from "@/hooks/battle/npc/ai/useAi";
import type { useBabidiShield } from "@/hooks/battle/player/characters/babidi/useShield";
import type { useBlinkAnimation } from "@/hooks/battle/player/characters/natsuki/blinkAnimation/useBlinkAnimation";
import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { BabidiTarget } from "@/utils/types/character/babidi";

/**
 * Contratos das ações de combate (`useBattleCombatActions`): o que o player
 * faz quando age (golpes, charge, combo) e o que a batalha conta (bloqueio,
 * dano, esquiva, acertos).
 */
export type BattleCombatActionsProps = {
  battle: ReturnType<typeof useBattleSystem>;
  refs: ReturnType<typeof useBattleRefs>;
  npc: ReturnType<typeof useNpcAI>;
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  playerClass: PlayerClass;
  npcType: string;
  npcClass: NPCClass;
  npcLevel: number;
  progress: ReturnType<typeof useBattleStageSetup>["progress"];
  /** Arma equipada do Yvel (o special dela troca a arma em uso). */
  weapon: YvelWeapon | undefined;
  /** Equipa uma arma do Yvel (a forja do ataque carregado, issue #217). */
  equipYvelWeapon: (weapon: YvelWeapon) => boolean;
  summons: ReturnType<typeof useBattleStageSetup>["summons"];
  setSummons: ReturnType<typeof useBattleStageSetup>["setSummons"];
  giveSummonRewards: ReturnType<typeof useBattleStageSetup>["giveSummonRewards"];
  setPlayerState: ReturnType<typeof useBattleStageSetup>["setPlayerState"];
  ematronComboMultiplierRef: ReturnType<
    typeof useBattleStageSetup
  >["ematronComboMultiplierRef"];
  ematronComboActiveRef: ReturnType<
    typeof useBattleStageSetup
  >["ematronComboActiveRef"];
  ematronComboAirActiveRef: ReturnType<
    typeof useBattleStageSetup
  >["ematronComboAirActiveRef"];
  ematronComboStepIndexRef: ReturnType<
    typeof useBattleStageSetup
  >["ematronComboStepIndexRef"];
  forcePunchRef: ReturnType<typeof useBattleStageSetup>["forcePunchRef"];
  /** Básico do babidi: dispara o projétil de energia no press. */
  babidiFireRef: RefObject<
    ((player: Player, targets: BabidiTarget[]) => boolean) | null
  >;
  /** Colisão do projétil do babidi: resolve o dano. */
  babidiOnHitRef: RefObject<((target: BabidiTarget) => void) | null>;
  /** Míssil do babidi: dispara no press. */
  babidiMissileFireRef: RefObject<
    ((player: { x: number; y: number }) => boolean) | null
  >;
  /** Colisão do míssil do babidi: resolve o dano. */
  babidiMissileOnHitRef: RefObject<((target: BabidiTarget) => void) | null>;
  vastolordMultiplierRef: RefObject<() => number>;
  cursedEnergyEnabled: boolean;
  battleManaRef: RefObject<BattleManaApi | null>;
  honoredOneActiveRef: RefObject<boolean>;
  playSound: ReturnType<typeof useBattleStageSetup>["playSound"];
  triggerBlink: ReturnType<typeof useBlinkAnimation>["triggerBlink"];
  divergentFistActive: boolean;
  divergentFistRef: RefObject<boolean>;
  setDivergentFistActive: React.Dispatch<React.SetStateAction<boolean>>;
  incrementBlockCounter: ReturnType<
    typeof useBattleStageSetup
  >["incrementBlockCounter"];
  incrementDamageTaken: ReturnType<
    typeof useBattleStageSetup
  >["incrementDamageTaken"];
  incrementDodgeCounter: ReturnType<
    typeof useBattleStageSetup
  >["incrementDodgeCounter"];
  incrementDamageDealt: ReturnType<
    typeof useBattleStageSetup
  >["incrementDamageDealt"];
  /** Shield do babidi: o bloqueio registra o lado que segurou o golpe. */
  babidiShield: ReturnType<typeof useBabidiShield>;
};
