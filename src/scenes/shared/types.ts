export type TileRouteFunction = (
  player: ExplorePosition,
  quests: Quest[],
  flags: FlagId[],
) => string | null;

/**
 * API que a cena de batalha recebe montada. Este é o único lugar onde os
 * tipos da camada `hooks` entram na assinatura de um tipo compartilhado:
 * a cena é a camada que compõe os hooks, então a dependência fica aqui e
 * não em `utils/types/` (que é a base e não deve conhecer React).
 */
import type { useBattleSystem } from "@/hooks/battle/main/useSystem";
import type { useNpcAI } from "@/hooks/battle/npc/useAi";
import type { useChargeAttack } from "@/hooks/battle/charge/useAttack";
import type { useSrGuaxinimOraPunch } from "@/hooks/battle/player/characters/srGuaxinim/useSrGuaxinimOraPunch";
import type { useSrGuaxinimKillerQueen } from "@/hooks/battle/player/characters/srGuaxinim/useSrGuaxinimKillerQueen";
import type { useKokusenAnimation } from "@/hooks/battle/player/characters/natsuki/useKokusenAnimation";
import type { useBlackFlashAnimation } from "@/hooks/battle/player/characters/natsuki/useBlackFlashAnimation";
import type { useSpecialIntro } from "@/hooks/battle/modals/useSpecialIntro";
import type { usePlayerSpecialProjectile } from "@/hooks/battle/player/usePlayerSpecialProjectile";
import type { useCoffinAnimation } from "@/hooks/battle/summon/useCoffinAnimation";
import type { useNpcSetup } from "@/hooks/battle/npc/useSetup";
import type { useEmatronClone } from "@/hooks/battle/player/characters/ematron/useClone";
import type { useEmatronGenkiDama } from "@/hooks/battle/player/characters/ematron/useGenkiDama";
import type { useVastolordLaser } from "@/hooks/battle/player/characters/marshadow/useVastolordLaser";
import type { useKamehameha } from "@/hooks/battle/player/characters/ematron/useKamehameha";
import type { useAtomic } from "@/hooks/battle/player/characters/marshadow/useAtomic";
import type { useMugetsuExpansion } from "@/hooks/battle/player/characters/marshadow/useMugetsuExpansion";
import type { useGranReyCero } from "@/hooks/battle/player/characters/marshadow/useGranReyCero";
import type { CameraFocus } from "@/hooks/battle/effects/useCameraSequence";
import type { CharacterId } from "@/data/characters/list";
import type { SummonedNpc } from "@/utils/types/npc/npc";
import type { CharactersProgress } from "@/data/characters/defaultProgress";
import type { ReplayData } from "@/utils/types/replay";
import type { NavigateFunction } from "react-router";
import type {
  BabidiEnergyProjectile,
  BabidiPortal,
  BabidiPortalFocus,
  BabidiPortalGhost,
  BabidiShieldSide,
  BabidiShieldSides,
} from "@/utils/types/character/babidi";
import type { BabidiAttackVariant } from "@/utils/types/character/babidi/attack";

type Battle = ReturnType<typeof useBattleSystem>;
type Npc = ReturnType<typeof useNpcAI>;

export type BattleSceneApi = {
  player: Player;
  npc: Npc;
  battle: Battle;
  npcStats: ReturnType<typeof useNpcSetup>["npcStats"];
  npcLevel: number;
  summons: SummonedNpc[];
  allies: SummonedNpc[];
  coffins: ReturnType<typeof useCoffinAnimation>["coffins"];
  pet: Battle["pet"];
  petSkill: Battle["petSkill"];
  charProgress: CharactersProgress[CharacterId];
  missingXp: number;
  xpReward: number;
  lastRewards: unknown;
  showVictory: boolean;
  showDefeat: boolean;
  showOutro: unknown;
  showHighlight: boolean;
  highlightData: unknown;
  handleCloseHighlight: () => void;
  handleCloseOutro: () => void;
  handleRetry: () => void;
  handleContinue: () => void;
  navigate: NavigateFunction;
  showIntro: boolean;
  skipIntro: () => void;
  skipVictoryDelay: boolean;
  comboCount: number;
  comboRank: string;
  comboProgress: number;
  nextRank: string | null;
  charge: ReturnType<typeof useChargeAttack>;
  defeatElapsed: number;
  victoryElapsed: number;
  bestTime: number;
  defeatProgress: number;
  grabFlipped: boolean;
  getReplayData: () => ReplayData | null;
  isRecording: boolean;
  training: boolean | undefined;
  controlsDisabled: boolean;
  /** Menu da batalha aberto: a cena congela as animações de intro/domínio. */
  battlePaused: boolean;
  showRetry: boolean;
  playerProjectile: ReturnType<
    typeof usePlayerSpecialProjectile
  >["playerProjectile"];
  killerQueen: ReturnType<typeof useSrGuaxinimKillerQueen>["killerQueen"];
  bombTargets: ReturnType<typeof useSrGuaxinimKillerQueen>["bombTargets"];
  killerQueenSprite: ReturnType<
    typeof useSrGuaxinimKillerQueen
  >["killerQueenSprite"];
  bombSprite: ReturnType<typeof useSrGuaxinimKillerQueen>["bombSprite"];
  explosionSprite: ReturnType<
    typeof useSrGuaxinimKillerQueen
  >["explosionSprite"];
  extraPunches: ReturnType<typeof useSrGuaxinimOraPunch>["punches"];
  extraPunchSprite: string;
  yvelWeapon: YvelWeapon | undefined;
  switchWeapon: () => void;
  convertCursedEnergy: () => void;
  blink: () => void;
  showClear: boolean;
  vastolordLaserStacks: number;
  honoredSequence: boolean;
  skipVastolordTransform: () => void;
  skipHonoredOne: () => void;
  blinkVisual:
    | import("@/hooks/battle/player/characters/natsuki/useBlinkAnimation").BlinkVisual
    | null;
  divergentFistActive: boolean;
  activateDivergentFist: () => void;
  divergentFistFrame: number | null;
  honoredOneActive: boolean;
  kokusenActive: ReturnType<typeof useKokusenAnimation>["kokusenActive"];
  kokusenFrame: ReturnType<typeof useKokusenAnimation>["kokusenFrame"];
  blackFlashActive: ReturnType<
    typeof useBlackFlashAnimation
  >["blackFlashActive"];
  blackFlashVariant: ReturnType<
    typeof useBlackFlashAnimation
  >["blackFlashVariant"];
  cameraFocus: CameraFocus;
  triggerAbilityCameraFocus: (characterId: CharacterId, abilityId: string) => boolean;
  vastolordActive: boolean;
  vastolordRemainingMs: number;
  /** Quadro da transformação do marshadow (0=screamOne … 3=transformated) ou null. */
  vastolordTransformationFrame: number | null;
  specialIntroActive: ReturnType<typeof useSpecialIntro>["specialIntroActive"];
  specialIntroCharacter: ReturnType<
    typeof useSpecialIntro
  >["specialIntroCharacter"];
  /** Forma do personagem no intro (o background do laser vive em vastolordForm/). */
  specialIntroForm: ReturnType<typeof useSpecialIntro>["specialIntroForm"];
  lootBags: import("@/utils/types/battle/loot").BattleLootBag[];
  lootActive: boolean;
  lootNotifications: import("@/utils/types/battle/loot").LootNotification[];
  clearLootNotifications: () => void;
  npcClass: NPCClass;
  ematronClone: ReturnType<typeof useEmatronClone>["cloneVisual"];
  hakai: boolean;
  clonePress: () => void;
  cloneRelease: () => void;
  cloneUsable: boolean;
  kiChargePress: () => void;
  kiChargeRelease: () => void;
  kiChargeUsable: boolean;
  genkiDamaVisual: ReturnType<typeof useEmatronGenkiDama>["genkiDamaVisual"];
  genkiDamaPress: () => void;
  genkiDamaRelease: () => void;
  genkiDamaUsable: boolean;
  vastolordLaser: ReturnType<typeof useVastolordLaser>["beam"];
  vastolordLaserPress: () => void;
  vastolordLaserUsable: boolean;
  /** Feixe de Kamehameha do ematron (efeito em curso, ou null). */
  kamehameha: ReturnType<typeof useKamehameha>["effect"];
  kamehamehaPress: () => void;
  kamehamehaUsable: boolean;
  specialIntroAbility: ReturnType<
    typeof useSpecialIntro
  >["specialIntroAbility"];
  atomicHalo: ReturnType<typeof useAtomic>["halo"];
  atomicExplosion: ReturnType<typeof useAtomic>["explosion"];
  atomicCuts: ReturnType<typeof useAtomic>["cuts"];
  atomicFlash: ReturnType<typeof useAtomic>["flash"];
  atomicPress: () => void;
  atomicUsable: boolean;
  atomicRemaining: number;
  /**
   * Habilidade ativa própria do personagem (SrGuaxinim/Killer Queen,
   * Laricell/Explosão de Stacks): 20s de cooldown com CDR. Substitui o antigo
   * "special" universal, que não existe mais.
   */
  activeAbilityPress: () => void;
  activeAbilityUsable: boolean;
  activeAbilityRemaining: number;
  mugetsuSweep: ReturnType<typeof useMugetsuExpansion>["mugetsuSweep"];
  domainExpansionActive: ReturnType<
    typeof useMugetsuExpansion
  >["domainExpansionActive"];
  mugetsuBlink: ReturnType<typeof useMugetsuExpansion>["mugetsuBlink"];
  disintegrating: ReturnType<typeof useMugetsuExpansion>["disintegrating"];
  domainExpansionPress: () => void;
  domainExpansionUsable: boolean;
  /** Overlay ativo do burst da Expansão (marshadow usa `domainExpansionActive`). */
  domainBurstActive: boolean;
  /**
   * Preenchimento `expansion.svg` em cena (marshadow na varredura, natsuki nos
   * 5s da Muryōkūsho).
   */
  domainBackgroundActive: boolean;
  /** Quebra do vidro: algum inimigo sobreviveu e o `expansion.svg` estilhaça. */
  domainShattering: boolean;
  granReyCeroEffect: ReturnType<typeof useGranReyCero>["effect"];
  granReyCeroPress: () => void;
  granReyCeroUsable: boolean;
  /** Esfera das habilidades do natsuki (blue/red/purple). */
  sphere: import("@/utils/types/character/natsuki").NatsukiSphere | null;
  /** Foco de câmera enquanto a blue é controlada. */
  sphereFocus:
    import("@/utils/types/character/natsuki").NatsukiSphereFocus | null;
  /** Ativo durante o Setup (shake de cast). */
  castActive: boolean;
  /** Furo no sprite do NPC quando a purple o mata (junto com `isNpcDying`). */
  purpleHole: boolean;
  bluePress: () => void;
  blueUsable: boolean;
  redPress: () => void;
  redUsable: boolean;
  /** Fusão blue+red → purple (arraste um botão de esfera sobre o outro). */
  purplePress: () => void;
  purpleUsable: boolean;
  granReyCeroRemaining: number;
  /** Projéteis de energia do ataque básico do babidi em voo. */
  babidiEnergyProjectiles: BabidiEnergyProjectile[];
  babidiMissileProjectiles: import("@/utils/types/character/babidi").BabidiMissileProjectile[];
  fishingNet: { hp: number; maxHp: number; x: number; y: number } | null;
  fishingNetPress: () => void;
  /** Variante de mão do sprite do ataque básico do babidi (pose do golpe atual). */
  babidiAttackVariant: BabidiAttackVariant;
  /** Nonces dos shields de bloqueio do babidi por lado (`0` = inativo). */
  babidiShieldSides: BabidiShieldSides;
  /** Encerra o shield de um lado quando ele termina o fade-out. */
  onBabidiShieldEnd: (side: BabidiShieldSide, nonce: number) => void;
  /** Portais fincados no mapa (Energia Dimensional do babidi). */
  babidiPortals: BabidiPortal[];
  /** Fantasma do posicionamento (antes de soltar o botão) ou `null`. */
  babidiPortalGhost: BabidiPortalGhost | null;
  /** Índice do tipo destacado no seletor, ou `null` se o seletor está fechado. */
  babidiPortalSelection: number | null;
  /** Player no "voo do portal" (override de sprite pós-teletransporte). */
  babidiPortalLanding: boolean;
  /** Foco de câmera durante o voo do portal. */
  babidiPortalFocus: BabidiPortalFocus;
  /** Clique no botão: abre o seletor (ou desfaz o último portal se cheio). */
  babidiPortalClick: () => void;
  /** Escolha do tipo pelo card do modal (entra no posicionamento). */
  babidiPortalPick: (index: number) => void;
  /** Se a habilidade pode ser usada agora (portais cheios ou guard + energia). */
  babidiPortalUsable: boolean;
  /** Quantidade de portais fincados. */
  babidiPortalCount: number;
  /** Custo em energia de cada portal (25% da energia máxima). */
  babidiPortalCost: number;
  /** Teto de portais simultâneos. */
  babidiPortalMaxPortals: number;
};
