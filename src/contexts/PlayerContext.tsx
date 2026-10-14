import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { usePlayerMovement } from "@/hooks/player/usePlayerMovement";
import { useBattleMovement } from "@/hooks/battle/player/useMovement";
import { useLatestRef } from "@/hooks/useLatestRef";
import {
  EXPLORE_MOVE_INTERVAL,
  type BlockedTile,
} from "@/gameRules/movement/explore";
import type { CollisionParams } from "@/utils/types/battle/collision";
import { useInventory } from "@/contexts/InventoryContext";
import { useNavbar } from "@/contexts/NavbarContext";
import { useEquipment } from "@/contexts/EquipmentContext";
import { useCharacterProgress } from "@/contexts/CharacterProgressContext";
import { usePlayerAnimation } from "@/hooks/battle/player/usePlayerAnimation";
import { useEmanuelCombo } from "@/hooks/battle/player/characters/ematron/useEmanuelCombo";
import { useTimeScale } from "@/hooks/battle/time/useTimeScale";
import { BATTLE_DEFAULT_STATE } from "@/gameRules/battle/defaultState";
import { useBattleCollisionRef } from "@/hooks/battle/utilities/useBattleCollisionRef";
import { CHARACTER_KEY, PLAYER_CLASS_KEY } from "@/data/storageKeys";
import { slotKey } from "@/services/save/slotManager";
import { isCharacter } from "@/data/characters/list";
import { useSettings } from "@/hooks/settings/useSetting";

/**
 * Estado que muda com alta frequência (a cada movimento/ataque do player).
 * Quem só lê o player assina este contexto.
 */
type PlayerStateContextType = {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  playerClass: PlayerClass;
};

/**
 * Ações e refs estáveis: identidade não muda entre renders do provider, então
 * consumidores que só chamam ações não re-renderizam junto com o player.
 */
type PlayerActionsContextType = {
  difficulty: NpcDifficulty;
  setDifficulty: (difficulty: NpcDifficulty) => void;

  setPosition: (
    x: number,
    y: number,
    direction?: Player["direction"],
    height?: number,
  ) => void;
  setCharacter: (character: Player["character"]) => void;

  moveUp: () => void;
  moveDown: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  openInventory: () => void;
  openNavbar: () => void;

  moveUpBattle: () => void;
  startMoveLeft: () => void;
  stopMoveLeft: () => void;
  startMoveRight: () => void;
  stopMoveRight: () => void;
  startMoveUpExplore: () => void;
  stopMoveUpExplore: () => void;
  startMoveDownExplore: () => void;
  stopMoveDownExplore: () => void;
  startMoveLeftExplore: () => void;
  stopMoveLeftExplore: () => void;
  startMoveRightExplore: () => void;
  stopMoveRightExplore: () => void;
  blockStart: () => void;
  blockEnd: () => void;
  toggleCrouch: () => void;
  attack: () => void;
  special: () => void;
  dash: (direction: "left" | "right") => void;
  setPlayerState: (state: PlayerState) => void;

  setMap: (map: number[][]) => void;
  setHeightMap: (heightMap: number[][]) => void;
  setMode: (mode: PlayerMode) => void;
  restoreMode: () => void;
  resetBattleState: () => void;
  setBattleCollision: (params: CollisionParams) => void;
  setBlockedTiles: (tiles: BlockedTile[]) => void;

  chooseClass: (cls: PlayerClass) => void;

  lastBlockPressRef: React.RefObject<number>;
  lastAttackPressRef: React.RefObject<number>;
  battleTenacityRef: React.RefObject<number>;
  freezeActionsUntilRef: React.RefObject<number>;

  /** Punho Divergente do riquelme: true força o próximo ataque a ser um soco. */
  forcePunchRef: React.RefObject<boolean>;

  /** Sequência "O Mais Honrado": instante de início da subida (0 = inativa). */
  honoredRiseStartRef: React.RefObject<number>;
  /** Sequência "O Mais Honrado": y do jogador no instante em que ela disparou. */
  honoredRiseStartYRef: React.RefObject<number>;
  /** Sequência "O Mais Honrado": true enquanto o riquelme está caindo (pouso vira idleCrounched). */
  honoredFallRef: React.RefObject<boolean>;

  /** Genki Dama do emanuel: instante de início da subida (0 = inativa). */
  genkiDamaRiseStartRef: React.RefObject<number>;
  /** Genki Dama do emanuel: y do jogador no instante em que ela disparou. */
  genkiDamaRiseStartYRef: React.RefObject<number>;

  /** Combo do emanuel: multiplicador do último step avançado no press. */
  emanuelComboMultiplierRef: React.RefObject<number>;
  /** Combo do emanuel: true quando o último press avançou o combo. */
  emanuelComboActiveRef: React.RefObject<boolean>;
  /** Combo do emanuel: true durante a sequência aérea (airKick windup). */
  emanuelComboAirActiveRef: React.RefObject<boolean>;
  /** Combo do emanuel: índice do último step avançado no press. */
  emanuelComboStepIndexRef: React.RefObject<number>;

  setTimeScale: (scale: number) => void;
  resetTimeScale: () => void;
  timeScaleRef: React.RefObject<number>;
};

type PlayerContextType = PlayerStateContextType & PlayerActionsContextType;

const PlayerStateContext = createContext<PlayerStateContextType | null>(null);
const PlayerActionsContext = createContext<PlayerActionsContextType | null>(
  null,
);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { difficulty, setDifficulty } = useSettings();

  const [player, setPlayer] = useState<Player>(() => {
    const savedCharacter = localStorage.getItem(slotKey(CHARACTER_KEY));
    return {
      gridX: 6,
      gridY: 11,
      height: 0,
      direction: "up",
      character: isCharacter(savedCharacter) ? savedCharacter : "marcelo",
      ...BATTLE_DEFAULT_STATE,
      mode: "explore",
    };
  });

  const previousModeRef = useRef<PlayerMode>("explore");
  const battleTenacityRef = useRef(0);
  const { progress } = useCharacterProgress();
  const { timeScaleRef, setTimeScale, resetTimeScale } = useTimeScale();
  const emanuelCombo = useEmanuelCombo();
  // Riquelme: o básico intercala kick/attack/punch e o punch deriva do windup
  // `preAttack` (mesmo mecanismo do combo do emanuel). O press marca aqui qual
  // desfecho este windup apresenta; o `usePlayerAnimation` lê e limpa.
  const riquelmePunchRef = useRef(false);
  const playerRef = useLatestRef(player);
  const emanuelComboMultiplierRef = emanuelCombo.multiplierRef;
  const emanuelComboActiveRef = emanuelCombo.activeRef;
  const emanuelComboAirActiveRef = emanuelCombo.airActiveRef;
  const emanuelComboStepIndexRef = emanuelCombo.stepIndexRef;
  const resetEmanuelCombo = emanuelCombo.reset;

  useEffect(() => {
    resetEmanuelCombo();
  }, [player.character, player.mode, resetEmanuelCombo]);

  usePlayerAnimation(
    player,
    setPlayer,
    battleTenacityRef,
    (progress[player.character]?.sleep ?? 0) > 0,
    timeScaleRef,
    emanuelCombo,
    riquelmePunchRef,
  );

  const movingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (player.moving) {
      if (movingTimerRef.current) clearTimeout(movingTimerRef.current);
      movingTimerRef.current = setTimeout(() => {
        setPlayer((p) => (p.moving ? { ...p, moving: false } : p));
      }, EXPLORE_MOVE_INTERVAL);
    }
    return () => {
      if (movingTimerRef.current) clearTimeout(movingTimerRef.current);
    };
  }, [player.moving, player.gridX, player.gridY, setPlayer]);

  const [currentMap, setCurrentMap] = useState<number[][]>([]);
  const [currentHeightMap, setCurrentHeightMap] = useState<number[][]>([]);
  const blockedTilesRef = useRef<BlockedTile[]>([]);
  const { toggleInventory } = useInventory();
  const { toggleNavbar, registerModeHandlers } = useNavbar();

  // Regras de movimento re-criam as funções a cada render; os refs abaixo
  // garantem que os wrappers estáveis expostos pelo contexto sempre chamem
  // a versão mais recente.
  const movement = usePlayerMovement(
    currentMap,
    currentHeightMap,
    player,
    setPlayer,
    blockedTilesRef,
  );
  const movementRef = useRef(movement);
  movementRef.current = movement;

  const [playerClass, setPlayerClass] = useState<PlayerClass>(() => {
    const saved = localStorage.getItem(slotKey(PLAYER_CLASS_KEY));
    if (saved === "fracote" || saved === "idiota" || saved === "amostradinho")
      return saved;
    return null;
  });

  useEffect(() => {
    if (playerClass)
      localStorage.setItem(slotKey(PLAYER_CLASS_KEY), playerClass);
  }, [playerClass]);

  const battleCollisionRef = useBattleCollisionRef();
  const lastBlockPressRef = useRef(0);
  const lastAttackPressRef = useRef(0);
  const freezeActionsUntilRef = useRef(0);
  const playerModeRef = useRef<PlayerMode>(player.mode);
  playerModeRef.current = player.mode;

  const forcePunchRef = useRef(false);

  const honoredRiseStartRef = useRef(0);
  const honoredRiseStartYRef = useRef(0);
  const honoredFallRef = useRef(false);

  const genkiDamaRiseStartRef = useRef(0);
  const genkiDamaRiseStartYRef = useRef(0);

  const battle = useBattleMovement(
    setPlayer,
    battleCollisionRef,
    lastBlockPressRef,
    playerModeRef,
    freezeActionsUntilRef,
    lastAttackPressRef,
    honoredRiseStartRef,
    honoredRiseStartYRef,
    honoredFallRef,
    forcePunchRef,
    emanuelCombo,
    playerRef,
    genkiDamaRiseStartRef,
    genkiDamaRiseStartYRef,
    riquelmePunchRef,
  );
  const battleRef = useRef(battle);
  battleRef.current = battle;

  // ── Ações estáveis (useCallback + ref) ──────────────────────────────

  const moveUp = useCallback(() => movementRef.current.moveUp(), []);
  const moveDown = useCallback(() => movementRef.current.moveDown(), []);
  const moveLeft = useCallback(() => movementRef.current.moveLeft(), []);
  const moveRight = useCallback(() => movementRef.current.moveRight(), []);
  const startMoveUpExplore = useCallback(
    () => movementRef.current.startMoveUpExplore(),
    [],
  );
  const stopMoveUpExplore = useCallback(
    () => movementRef.current.stopMoveUpExplore(),
    [],
  );
  const startMoveDownExplore = useCallback(
    () => movementRef.current.startMoveDownExplore(),
    [],
  );
  const stopMoveDownExplore = useCallback(
    () => movementRef.current.stopMoveDownExplore(),
    [],
  );
  const startMoveLeftExplore = useCallback(
    () => movementRef.current.startMoveLeftExplore(),
    [],
  );
  const stopMoveLeftExplore = useCallback(
    () => movementRef.current.stopMoveLeftExplore(),
    [],
  );
  const startMoveRightExplore = useCallback(
    () => movementRef.current.startMoveRightExplore(),
    [],
  );
  const stopMoveRightExplore = useCallback(
    () => movementRef.current.stopMoveRightExplore(),
    [],
  );
  const clearAllIntervals = useCallback(
    () => movementRef.current.clearAllIntervals(),
    [],
  );

  const moveUpBattle = useCallback(() => battleRef.current.moveUpBattle(), []);
  const startMoveLeft = useCallback(
    () => battleRef.current.startMoveLeft(),
    [],
  );
  const stopMoveLeft = useCallback(() => battleRef.current.stopMoveLeft(), []);
  const startMoveRight = useCallback(
    () => battleRef.current.startMoveRight(),
    [],
  );
  const stopMoveRight = useCallback(
    () => battleRef.current.stopMoveRight(),
    [],
  );
  const blockStart = useCallback(() => battleRef.current.blockStart(), []);
  const blockEnd = useCallback(() => battleRef.current.blockEnd(), []);
  const toggleCrouch = useCallback(() => battleRef.current.toggleCrouch(), []);
  const attack = useCallback(() => battleRef.current.attack(), []);
  const special = useCallback(() => battleRef.current.special(), []);
  const dash = useCallback(
    (direction: "left" | "right") => battleRef.current.dash(direction),
    [],
  );
  const setPlayerState = useCallback(
    (state: PlayerState) => battleRef.current.setPlayerState(state),
    [],
  );

  const setBattleCollision = useCallback(
    (params: CollisionParams) => {
      battleCollisionRef.current = params;
    },
    [battleCollisionRef],
  );

  const setBlockedTiles = useCallback((tiles: BlockedTile[]) => {
    blockedTilesRef.current = tiles;
  }, []);

  useEffect(() => {
    if (player.mode !== "explore") clearAllIntervals();
  }, [player.mode, clearAllIntervals]);

  const setMap = useCallback((map: number[][]) => {
    setCurrentMap(map);
  }, []);

  const setHeightMap = useCallback((heightMap: number[][]) => {
    setCurrentHeightMap(heightMap);
  }, []);

  const chooseClass = useCallback((cls: PlayerClass) => {
    setPlayerClass(cls);
  }, []);

  const openInventory = useCallback(() => {
    if (playerModeRef.current !== "explore") return;
    toggleInventory();
  }, [toggleInventory]);

  const openNavbar = useCallback(() => {
    const mode = playerModeRef.current;
    if (mode !== "explore" && mode !== "menu") return;
    toggleNavbar();
  }, [toggleNavbar]);

  const setMode = useCallback(
    (mode: PlayerMode) => {
      setPlayer((p) => ({
        ...p,
        mode,
        ...(mode === "battle" && p.mode !== "battle"
          ? BATTLE_DEFAULT_STATE
          : {}),
      }));
      if (mode === "menu" && playerModeRef.current !== "menu") {
        previousModeRef.current = playerModeRef.current;
      }
    },
    [setPlayer],
  );

  const restoreMode = useCallback(() => {
    // Nunca derrubar o mode "battle": fechar uma navbar da exploração durante
    // o início de uma batalha não pode reverter o mode da cena de luta.
    setPlayer((p) =>
      p.mode === "battle" ? p : { ...p, mode: previousModeRef.current },
    );
  }, [setPlayer]);

  useEffect(() => {
    registerModeHandlers({ restoreMode, setMode });
  }, [registerModeHandlers, restoreMode, setMode]);

  const resetBattleState = useCallback(() => {
    setPlayer((p) => ({ ...p, ...BATTLE_DEFAULT_STATE }));
  }, [setPlayer]);

  const setPosition = useCallback(
    (
      x: number,
      y: number,
      direction: Player["direction"] = "down",
      height?: number,
    ) => {
      setPlayer((prev) => ({
        ...prev,
        gridX: x,
        gridY: y,
        direction,
        ...(height !== undefined ? { height } : {}),
      }));
    },
    [setPlayer],
  );

  const setCharacter = useCallback(
    (character: Player["character"]) => {
      localStorage.setItem(slotKey(CHARACTER_KEY), character);
      setPlayer((prev) => ({ ...prev, character }));
    },
    [setPlayer],
  );

  const { getEquippedInfo } = useEquipment();

  useEffect(() => {
    const equippedPet = getEquippedInfo(player.character, "pet");
    const hasTurkeyPet = equippedPet?.id === "pet_turkey";
    setPlayer((prev) =>
      prev.hasPeru === hasTurkeyPet ? prev : { ...prev, hasPeru: hasTurkeyPet },
    );
  }, [getEquippedInfo, player.character, setPlayer]);

  // ── Valores dos contextos ───────────────────────────────────────────

  const stateValue = useMemo(
    () => ({ player, setPlayer, playerClass }),
    [player, setPlayer, playerClass],
  );

  const actionsValue = useMemo(
    () => ({
      difficulty,
      setDifficulty,

      setPosition,
      setCharacter,

      moveUp,
      moveDown,
      moveLeft,
      moveRight,
      openInventory,
      openNavbar,

      moveUpBattle,
      startMoveLeft,
      stopMoveLeft,
      startMoveRight,
      stopMoveRight,
      startMoveUpExplore,
      stopMoveUpExplore,
      startMoveDownExplore,
      stopMoveDownExplore,
      startMoveLeftExplore,
      stopMoveLeftExplore,
      startMoveRightExplore,
      stopMoveRightExplore,
      blockStart,
      blockEnd,
      toggleCrouch,
      attack,
      special,
      dash,
      setPlayerState,

      setMap,
      setHeightMap,
      setMode,
      restoreMode,
      resetBattleState,
      setBattleCollision,
      setBlockedTiles,

      chooseClass,

      lastBlockPressRef,
      lastAttackPressRef,
      battleTenacityRef,
      freezeActionsUntilRef,

      forcePunchRef,

      honoredRiseStartRef,
      honoredRiseStartYRef,
      honoredFallRef,
      genkiDamaRiseStartRef,
      genkiDamaRiseStartYRef,
      emanuelComboMultiplierRef,
      emanuelComboActiveRef,
      emanuelComboAirActiveRef,
      emanuelComboStepIndexRef,

      setTimeScale,
      resetTimeScale,
      timeScaleRef,
    }),
    [
      difficulty,
      setDifficulty,
      setPosition,
      setCharacter,
      moveUp,
      moveDown,
      moveLeft,
      moveRight,
      openInventory,
      openNavbar,
      moveUpBattle,
      startMoveLeft,
      stopMoveLeft,
      startMoveRight,
      stopMoveRight,
      startMoveUpExplore,
      stopMoveUpExplore,
      startMoveDownExplore,
      stopMoveDownExplore,
      startMoveLeftExplore,
      stopMoveLeftExplore,
      startMoveRightExplore,
      stopMoveRightExplore,
      blockStart,
      blockEnd,
      toggleCrouch,
      attack,
      special,
      dash,
      setPlayerState,
      setMap,
      setHeightMap,
      setMode,
      restoreMode,
      resetBattleState,
      setBattleCollision,
      setBlockedTiles,
      chooseClass,
      lastBlockPressRef,
      lastAttackPressRef,
      battleTenacityRef,
      freezeActionsUntilRef,
      forcePunchRef,
      honoredRiseStartRef,
      honoredRiseStartYRef,
      honoredFallRef,
      genkiDamaRiseStartRef,
      genkiDamaRiseStartYRef,
      emanuelComboMultiplierRef,
      emanuelComboActiveRef,
      emanuelComboAirActiveRef,
      emanuelComboStepIndexRef,
      setTimeScale,
      resetTimeScale,
      timeScaleRef,
    ],
  );

  return (
    <PlayerStateContext.Provider value={stateValue}>
      <PlayerActionsContext.Provider value={actionsValue}>
        {children}
      </PlayerActionsContext.Provider>
    </PlayerStateContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePlayerState() {
  const ctx = useContext(PlayerStateContext);
  if (!ctx) throw new Error("usePlayerState precisa do PlayerProvider");
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePlayerActions() {
  const ctx = useContext(PlayerActionsContext);
  if (!ctx) throw new Error("usePlayerActions precisa do PlayerProvider");
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePlayer(): PlayerContextType {
  const state = usePlayerState();
  const actions = usePlayerActions();
  return useMemo(() => ({ ...state, ...actions }), [state, actions]);
}
