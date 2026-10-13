import { QUESTS } from "@/data/quests";
import { ITEMS } from "@/data/items";
import { FLAGS } from "@/data/flags";
import { NPC_CLASSES } from "@/data/npc";
import type { RewardId as RewardIdDef } from "@/data/rewards";
import type { EquipmentId as EquipmentIdDef } from "@/data/equipment";
import type {
  Quest as QuestDef,
  QuestType as QuestTypeDef,
  QuestRewardsType as QuestRewardsTypeDef,
  QuestFrequency as QuestFrequencyDef,
} from "@/utils/types/player/quest";
import type { SceneNPCData as SceneNpcDataDef } from "@/utils/types/maps/exploreScene";
import type {
  EquipmentRank as EquipmentRankDef,
  EquipmentSlot as EquipmentSlotDef,
} from "@/utils/types/player/equipment";
import type { Condition } from "@/utils/types/maps/conditions";
import type { Character as CharacterDef } from "@/utils/types/player/player";
import type { DamageKind as DamageKindDef } from "@/utils/types/battle/damageKind";

export {};

declare global {
  // ── Primitives ──────────────────────────────────────────
  type LastPage = string | undefined;
  type Direction = "up" | "down" | "left" | "right";

  // ── IDs (derivados de dados estáticos) ──────────────────
  type QuestId = Extract<keyof typeof QUESTS, string>;
  type ItemId = Extract<keyof typeof ITEMS, string>;
  type FlagId = Extract<keyof typeof FLAGS, string>;
  type NpcType = keyof typeof NPC_CLASSES;
  type CharacterId = CharacterDef;
  type EquipmentId = EquipmentIdDef;
  type RewardId = RewardIdDef;

  // ── Geometria ───────────────────────────────────────────
  type Position = { x: number; y: number };
  type ExplorePosition = {
    x: number;
    y: number;
    direction: Direction;
  };
  type PlayerPosition = {
    gridX: number;
    gridY: number;
    direction: Direction;
  };
  type ReplayViewportSize = {
    width: number;
    height: number;
  };

  // ── Stats (repetido em equipment, character, titles) ──
  type StatBlock = {
    hp: number;
    strength: number;
    /**
     * Técnica: dano das habilidades ativas de natureza física. Substituiu a
     * antiga `intelligence`, que alimentava todos os specials.
     */
    technique: number;
    /**
     * Espírito: dano das habilidades de natureza mágica e energia máxima.
     * Separado de `technique` porque o special declara de qual dos dois se
     * alimenta — see `SPECIAL_DMG_STAT` em `data/characters/abilities.ts`.
     */
    spirit: number;
    /**
     * Redução de cooldown bruta, em pontos percentuais. Passa pela curva
     * `getCooldownReduction`, então somar mais fontes rende cada vez menos e
     * o teto efetivo é 90%.
     */
    cooldownReduction: number;
    /**
     * Armadura base: conta para as DUAS colunas (física e mágica). As chaves
     * abaixo são o excedente de quem blindar só um lado — `physicalArmor`
     * (couro/placas) e `magicalArmor` (barreira arcana).
     */
    armor: number;
    physicalArmor?: number;
    magicalArmor?: number;
    shield: number;
    /**
     * Vampirismo: cura de N% do dano causado, só em ATAQUE BÁSICO. O special, o
     * dash e as habilidades não contam — para isso existe `universalVampirism`.
     */
    vampirism: number;
    /**
     * Vampirismo universal: cura de N% de QUALQUER dano que o jogador cause —
     * ataque básico, special, dash, habilidades e reflexão de dano. Não paga por
     * dano de terceiros (DoT, pets, aliados).
     */
    universalVampirism: number;
    reflect: number;
    tenacity: number;
    luck: number;
    maxHpDamage: number;
    trueDamage: number;
  };

  // ── Áudio / Transição ──────────────────────────────────
  type AudioConfig = {
    src: string;
    loop?: boolean;
    volume?: number;
  };

  type Transition = {
    positions: Position[];
    to: string;
  };

  // ── Diálogo ────────────────────────────────────────────
  // Valores existentes em public/assets/player/<char>/expressions/.
  type DialogueExpression =
    | "angry"
    | "angryFront"
    | "crossArms"
    | "default"
    | "desperate"
    | "disgust"
    | "good"
    | "happy"
    | "hungry"
    | "ops"
    | "rascal"
    | "special"
    | "talking"
    | "why"
    | "x1";

  type Dialogue = {
    src?: string;
    name: string;
    message: string;
    isPlayer?: boolean;
    expression?: DialogueExpression;
    soundSrc?: string;
    autoAdvanceOnSound?: boolean;
    /**
     * Disparado quando o jogador confirma a linha. Retornar `false` segura o
     * avanço: a linha só libera para a fala seguinte quando algo chamar `next()`
     * de novo. É o ponto de apoio para cutscenes em que um retrato precisa
     * terminar uma animação antes do NPC voltar a falar (ex.: o teleport do
     * Victor na abertura do tutorial de Config). O callback roda uma vez por
     * linha, então quem retoma o diálogo não o executa outra vez.
     */
    onConfirm?: () => boolean | void;
  };

  // ── Scene system ───────────────────────────────────────
  type SceneId =
    | "one"
    | "two"
    | "jailson-one"
    | "jailson-two"
    | "three"
    | "four"
    | "five"
    | "six"
    | "seven"
    | "eight"
    | "nine"
    | "afterpcroom-one"
    | "left-one"
    | "center-one"
    | "center-two"
    | "center-front"
    | "thirdclass"
    | "hell"
    | "secret-passage"
    | "footballcourt"
    | "pandemony";

  type SceneTile = {
    x: number;
    y: number;
    route?: string;
    getRoute?: (
      player: ExplorePosition,
      quests: Quest[],
      flags: FlagId[],
    ) => string | null;
    requiredQuest?: QuestId;
    blockedMessage?: string;
  };

  type SceneSign = {
    x: number;
    y: number;
    message: string;
  };

  type ScenePlateData = {
    src: string;
    gridX: number;
    gridY: number;
    message?: string;
  };

  type SceneCutscene = {
    videoSrc: string;
    npcGridX: number;
    npcGridY: number;
  };

  type SceneEvent =
    | { type: "openModal"; modal: "class" }
    | { type: "navigate"; to: string; delay?: number }
    | { type: "playSound"; src: string; volume?: number }
    | { type: "setFlag"; flagId: FlagId }
    | { type: "log"; message: string }
    | { type: "progressQuest"; id: QuestId; value: number }
    | { type: "giveQuest"; questId: QuestId }
    | { type: "addItem"; itemId: ItemId }
    | { type: "removeItem"; itemId: ItemId }
    | { type: "prepareTombstone"; locationId: string }
    | {
        type: "conditional";
        condition: Condition;
        then: SceneEvent[];
        else?: SceneEvent[];
      };

  type DialogueContext = {
    quests: Quest[];
    items: { id: ItemId }[];
    flags: FlagId[];
    character: CharacterId;
    lastPage?: LastPage;
    dialogueIndex?: number;
  };

  type NpcSrcResolver = (context: DialogueContext) => string;

  type SceneNPCData = SceneNpcDataDef;

  type ExploreSceneProps = {
    name?: string;
    map: number[][];
    heightMap?: number[][];
    dialogueData?: Dialogue[] | ((context: DialogueContext) => Dialogue[]);
    nextRoute?: string;
    initialPosition?:
      ExplorePosition | ((lastPage?: LastPage) => ExplorePosition);
    npcs?: SceneNPCData[];
    plates?: ScenePlateData[];
    audio?: AudioConfig;
    transitions?: Transition[];
    signs?: SceneSign[];
    onInteract?: (tile: number, x: number, y: number) => boolean;
    autoStartDialogue?: boolean | ((context: DialogueContext) => boolean);
    cutscene?: SceneCutscene;
    onFinish?: () => void;
    className?: string;
    lastPage?: LastPage;
    backgroundSize?: string;
    scaleFix?: number;
    tombstoneLocationId?: string;
  };

  type SceneConfig = Omit<ExploreSceneProps, "onInteract" | "className"> & {
    id: SceneId;
    background?: string;
    events?: SceneEvent[];
    tiles?: SceneTile[];
    plates?: ScenePlateData[];
    signs?: SceneSign[];
  };

  // ── NPC ─────────────────────────────────────────────────
  type NPCClass =
    "common" | "rare" | "epic" | "boss" | "legendary" | "supreme" | "omega";
  type NpcDifficulty = "easy" | "medium" | "hard" | "insano";
  type EquipmentRank = EquipmentRankDef;

  /** HP de projéteis destrutíveis (attack do jogador, colisão, NPC). */
  type ProjectileHp = {
    /** Identidade estável do projétil (alvo da Killer Queen, key do React). */
    id: string;
    hp: number;
    maxHp: number;
    /** Indestrutível: não pode ser destruído nem cortado (ex: esfera do Riquelme). */
    indestructible: boolean;
    /**
     * Natureza do dano ao acertar o player: decide qual coluna de armadura ele
     * fura. Ausente = física. Quem cria o projétil declara uma vez.
     */
    damageType?: DamageKindDef;
  };

  type ProjectileCommon = ProjectileHp & {
    variant: "common";
    x: number;
    y: number;
    startX: number;
    startY: number;
    dirX: number;
    dirY: number;
    sprite?: string;
    createdAt: number;
    state: "walk" | "idle";
    canCrouchDodge?: boolean;
    landsOnGround?: boolean;
  };

  type ProjectilePull = ProjectileHp & {
    variant: "pull";
    x: number;
    y: number;
    startX: number;
    startY: number;
    dirX: number;
    dirY: number;
    sprite?: string;
    createdAt: number;
    state: "walk" | "idle";
    pullTargetX: number;
  };

  type FallingSpear = {
    x: number;
    y: number;
    hit?: boolean;
  };

  type ProjectileRain = ProjectileHp & {
    variant: "rain";
    x: number;
    y: number;
    startX: number;
    startY: number;
    createdAt: number;
    sprite?: string;
    warningStartTime: number;
    warningDuration: number;
    spears: FallingSpear[];
  };

  /** Projétil cortado pelo ataque normal do Marshadow, dividido em duas partes. */
  type ProjectileCut = ProjectileHp & {
    variant: "cut";
    x: number;
    y: number;
    startX: number;
    startY: number;
    sprite?: string;
    createdAt: number;
    state: "idle";
    /** Fragmento superior (sobe, ~135°). */
    upper: { x: number; y: number };
    /** Fragmento inferior (desce, ~225°). */
    lower: { x: number; y: number };
    upperDirX: number;
    upperDirY: number;
    lowerDirX: number;
    lowerDirY: number;
  };

  /**
   * Projétil terrestre: rasteja rente ao chão, na horizontal, na direção que o
   * NPC encara até a ponta do mapa. Agachar **não** desvia — a hitbox abaixada
   * só engana projétil aéreo (regra `gameRules/npc/projectile/crouchDodge`);
   * dash continua sendo i-frame para qualquer elevação.
   *
   * É o tipo da burst do hungryKing (fase 2). Com `detonatesOnHit` o impacto
   * vira explosão (dano de impacto + push, via `onBurstHit`) e o projétil troca
   * para `impactSprite` antes de sumir; sem ele, o impacto é dano direto de
   * projétil comum e o projétil some na hora.
   */
  type ProjectileGround = ProjectileHp & {
    variant: "ground";
    x: number;
    y: number;
    dirX: number;
    createdAt: number;
    sprite: string;
    /** Impacto detona em explosão. Ausente = dano direto e o projétil some. */
    detonatesOnHit?: boolean;
    /** Sprite do estrago ao detonar (fallback no próprio sprite sem ele). */
    impactSprite?: string;
    /** true quando já atingiu o jogador — no modo detona, inicia o estrago. */
    impacted: boolean;
    impactedAt?: number;
  };

  type Projectile =
    | ProjectileCommon
    | ProjectilePull
    | ProjectileRain
    | ProjectileCut
    | ProjectileGround;

  // ── Player ──────────────────────────────────────────────
  // PlayerState é a união de dois blocos semânticos: `PlayerCanActState` (o
  // jogador conduz o personagem) e `PlayerCantActState` (o estado trava o
  // jogador — reação, defesa ou habilidade em andamento). Cada bloco é a união
  // dos grupos abaixo, que por sua vez dão nome às famílias de estados.
  //
  // Os `Set`s e predicados desses grupos ficam em
  // `src/gameRules/battle/playerStates.ts` — nenhum outro arquivo deve repetir
  // a lista de literais. `animationFlow` é `Record<PlayerState, …>` exaustivo,
  // então um estado novo sem entrada quebra a compilação.

  /** Locomoção no chão (a variante `pre*` é o windup da animação). */
  type PlayerMoveState = "walk" | "preWalk" | "run" | "preRun";
  /** Agachado — abaixa a hitbox, golpes altos passam por cima. */
  type PlayerCrouchState = "idleCrounched" | "walkCrounched";
  /** Espera / recuperação. */
  type PlayerIdleState = "idle" | "heal";
  /** No ar — a gravidade está no comando. */
  type PlayerAirState = "preJump" | "jump" | "falling" | "fallingAttack";
  /** Special aéreo. */
  type PlayerAirSpecialState =
    "preSpecialInAir" | "specialInAir" | "specialInAirFinish";
  /** Golpe aéreo do combo (`airGrab` é a exibição do windup em `jump`). */
  type PlayerAirMeleeState = "airGrab" | "airKick";
  /** Ataque básico: windup → golpe. */
  type PlayerBasicAttackState =
    "preAttack" | "attack" | "crit" | "preKick" | "kick";
  /** Golpes de solo do combo do emanuel. */
  type PlayerComboState = "punch" | "hook" | "lowKick";
  /** Special de solo, do windup (`preSpecial*`) ao golpe (`special`). */
  type PlayerSpecialState = "preSpecial" | "preSpecial2" | "special";
  /** Genki Dama do emanuel — o personagem sobe e fica flutuando. */
  type PlayerGenkiDamaState =
    "genkiDamaRising" | "preparingGenkiDama" | "throwGenkiDama";
  /** "I Am Atomic" do marcelo. */
  type PlayerAtomicState = "preparingAtomic" | "finalizatingAtomic";
  /** Expansão de Domínio do marcelo. */
  type PlayerDomainExpansionState = "preMugetsu" | "mugetsu";
  /** Laser da Forma Vastolord do marcelo. */
  type PlayerLaserState = "laser";
  /** "Gran Rey Cero" do marcelo. */
  type PlayerGranReyCeroState = "granReyCero";
  /**
   * Esferas do riquelme (habilidades "blue"/"red") e a fusão delas na purple:
   * a sequência é conduzida pelo hook `useRiquelmeSpheres`, não pelo
   * `animationFlow`. `purpleJunction` é o sprite `purple/junction.svg`, o
   * instante em que a blue e a red se fundem; o Setup (`one.svg` → `two.svg` →
   * `three.svg`) usa os três estados seguintes.
   */
  type PlayerSphereState =
    | "purpleJunction"
    | "sphereCast"
    | "sphereMove"
    | "sphereFire"
    | "blueSphereControl";
  /** Passiva "O Abençoado" (riquelme) — invencível enquanto sobe. */
  type PlayerHonoredState = "mostHonored";
  /** Locomoção com compromisso: dash e carga de ki. */
  type PlayerChargeState = "dash" | "charging" | "chargingKi";
  /** Defesa: bloqueio e a contra-ofensiva que sai dele. */
  type PlayerBlockState = "blocked" | "blockAttack";
  /** Reações que tiram o controle: atordoamento e contenção no chão. */
  type PlayerHitState = "stun" | "fallen";

  /**
   * Estados que seguram o personagem e travam novas ações: qualquer
   * `PlayerChargeState`, o O Abençoado e as habilidades de cast longas
   * (Genki Dama, o Laser da Forma Vastolord, o Gran Rey Cero e as esferas do
   * riquelme).
   */
  type PlayerActionLockState =
    | PlayerChargeState
    | PlayerHonoredState
    | PlayerGenkiDamaState
    | PlayerLaserState
    | PlayerGranReyCeroState
    | PlayerSphereState;

  /** O jogador não age: trava de ação, defesa ou reação a dano. */
  type PlayerCantActState =
    | PlayerActionLockState
    | PlayerBlockState
    | PlayerHitState
    | PlayerAtomicState
    | PlayerDomainExpansionState;

  type PlayerCanActState =
    | PlayerIdleState
    | PlayerMoveState
    | PlayerCrouchState
    | PlayerAirState
    | PlayerAirSpecialState
    | PlayerAirMeleeState
    | PlayerBasicAttackState
    | PlayerComboState
    | PlayerSpecialState;

  type PlayerState = PlayerCanActState | PlayerCantActState;

  type PlayerMode = "explore" | "battle" | "select" | "ui" | "map" | "menu";

  type PlayerClass = "fracote" | "idiota" | "amostradinho" | null;

  type LucasWeapon =
    | "withDoubleSwords"
    | "withSniper"
    | "withPistol"
    | "withSpear"
    | "withKunais"
    | "withStaff"
    | "withPocketKnife";

  type Player = {
    gridX: number;
    gridY: number;
    height: number;
    direction: Direction;
    character: CharacterId;
    x: number;
    y: number;
    velY: number;
    groundY: number;
    battleDirection: Direction;
    state: PlayerState;
    mode: PlayerMode;
    movementSpeed: number;
    hasPeru?: boolean;
    moving?: boolean;
    grabbedUntil?: number;
    bleedUntil: number;
    burnUntil: number;
    poisonUntil: number;
    paralyzedUntil: number;
    blindUntil: number;
    confusedUntil: number;
    frozenUntil: number;
    halfHealUntil: number;
    pullFromX: number;
    pullToX: number;
    pullStartTime: number;
    throwStartTime: number;
    throwFromX: number;
    throwToX: number;
  };

  type PlayerSpecialProjectile = {
    /** Id estável: a regra de tempo do O Mais Honrado isente a esfera por ele. */
    id: string;
    phase: "merge" | "move" | "fire";
    x: number;
    y: number;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    blueX: number;
    blueY: number;
    redX: number;
    redY: number;
    direction: Direction;
    /** A esfera do Riquelme é indestrutível: não sofre dano nem some ao colidir. */
    indestructible: boolean;
  };

  // ── Quest ───────────────────────────────────────────────
  // Fonte única: src/utils/types/player/quest.ts
  type QuestType = QuestTypeDef;
  type QuestRewardsType = QuestRewardsTypeDef;
  type QuestFrequency = QuestFrequencyDef;

  type Quest = QuestDef;

  type RewardProgress = {
    id: RewardId;
    label: string;
    current: number;
    requirement: number;
    reward: number;
    canClaim: boolean;
    charId?: CharacterId;
  };

  export type EquipmentSlot = EquipmentSlotDef;

  type EquipmentDropInfo = {
    id: EquipmentId;
    name: string;
    slot: EquipmentSlot;
    rank: EquipmentRank;
    enhance: number;
  };

  type ItemDropInfo = {
    id: ItemId;
    name: string;
    image?: string;
    qty: number;
  };

  /**
   * Baú/Chave que caiu na batalha. `image` é resolvido no sorteio (o registro
   * `ITEMS` já traz o sprite pronto via `chestPath`/`keyPath`) para o modal de
   * vitória só precisar desenhar — o mesmo caminho de `ItemDropInfo`.
   */
  type ChestKeyDropInfo = {
    id: ItemId;
    name: string;
    image?: string;
  };

  type RewardInfo = {
    coinReward: number;
    xpReward: number;
    equipmentDrops: EquipmentDropInfo[];
    itemDrops: ItemDropInfo[];
    chestDrop: ChestKeyDropInfo | null;
    keyDrop: ChestKeyDropInfo | null;
  };

  type DamageType =
    | "player"
    | "npc"
    | "special"
    | "pet"
    | "summon"
    | "ally"
    | "projectile"
    | "blocked"
    | "parry"
    | "crit"
    | "charge"
    | "reflect"
    | "miss"
    | "bleed"
    | "burn"
    | "poison"
    | "freeze"
    | "confuse"
    | "armor"
    | "heal";

  // ── Ground items (lootbags) ──────────────────────────────
  type GroundItem = {
    id: ItemId;
    qty: number;
  };

  type GroundLoot = {
    locationId: string;
    x: number;
    y: number;
    items: GroundItem[];
  };

  type GroundItemsSaveData = Record<string, GroundLoot>;

  type BombTarget = {
    id: string;
    x: number;
    y: number;
    phase: "bomb" | "explosion";
  };
}
