import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";

import { useGameControls } from "@/contexts/GameControlsContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useSkillGuard } from "@/hooks/battle/player/characters/useSkillGuard";

import { getGroundAtX } from "@/gameRules/battle/obstacles";
import { BATTLE_LIMITS } from "@/gameRules/movement/constants";
import {
  ALL_TIME_KINDS,
  applyTime,
  clearTime,
  type TimeEffect,
} from "@/gameRules/battle/time";
import { PLAYER_SPRITE_DIVISOR } from "@/data/grid";
import {
  LUCAUA_PORTAL_KINDS,
  LucauaPortalConstants,
} from "@/data/characters/lucaua/lucaua";

import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { SoundId } from "@/utils/audio/soundId";
import type { GameControlLayer } from "@/utils/types/player/controls";
import type { BattleObstacle } from "@/utils/types/maps/battle";
import type { NPCBattleState, SummonedNpc } from "@/utils/types/npc/npc";
import type { PetState } from "@/hooks/battle/player/pets/usePet";
import type {
  LucauaPortal,
  LucauaPortalFocus,
  LucauaPortalGhost,
  LucauaPortalKind,
} from "@/utils/types/character/lucaua";

/** Direção que o joystick pode empurrar o fantasma/seletor. */
type PortalDirection = "up" | "down" | "left" | "right";

/** Par de portais que uma travessia conecta (origem → destino). */
type PortalWarp = { dest: LucauaPortal; source: LucauaPortal };

/** Lista de obstáculos vazia estável (evita recriar array a cada render). */
const NO_OBSTACLES: BattleObstacle[] = [];

/** Id do efeito de time do congelamento — único por habilidade. */
const PORTAL_TIME_ID = "lucaua-portals";

type Props = {
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  npc: {
    x: number;
    y: number;
    updateNpc: (partial: Partial<NPCBattleState>) => void;
  };
  summons: SummonedNpc[];
  setSummons: Dispatch<SetStateAction<SummonedNpc[]>>;
  allies: SummonedNpc[];
  setAllies: Dispatch<SetStateAction<SummonedNpc[]>>;
  pet: PetState;
  setPet: Dispatch<SetStateAction<PetState>>;
  obstacles?: BattleObstacle[];
  PLAYER_SIZE: number;
  battleManaRef: RefObject<BattleManaApi | null>;
  timeRef: RefObject<TimeEffect[]>;
  freezeActionsUntilRef: RefObject<number>;
  isPausedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
};

/**
 * "Energia Dimensional" — portais do lucaua.
 *
 * Fluxo do botão (clique): um toque abre o seletor de tipo (mundo congelado);
 * esquerda/direita (ou o próprio cartão do modal) destaca um tipo e o input de
 * ataque confirma; o fantasma é então posicionado pelo joystick (ainda
 * congelado) e o ataque de novo finca o portal. Com dois portais no mapa, o
 * toque no botão desfaz o último e devolve a energia paga. O cancelar encerra
 * o fluxo sem gastar energia.
 *
 * Congelamento em duas frentes: o mundo para pelo efeito de time (`freeze`),
 * renovado a cada tick; o player é travado pelo `freezeActionsUntilRef`, porque
 * ele não faz parte dos `TimeKind`.
 *
 * Teleporte: cada entidade tem um "armado/desarmado" próprio — depois de
 * atravessar, ela fica desarmada até sair de todos os raios, o que impediria o
 * ping-pong infinito entre dois portais que se sobrepõem.
 */
export function useLucauaPortals({
  player,
  setPlayer,
  npc,
  summons,
  setSummons,
  allies,
  setAllies,
  pet,
  setPet,
  obstacles,
  PLAYER_SIZE,
  battleManaRef,
  timeRef,
  freezeActionsUntilRef,
  isPausedRef,
  disabledRef,
  battleEndedRef,
  playSound,
}: Props) {
  const { pushControls } = useGameControls();

  // ── Estado de render ───────────────────────────────────────────────────────
  const [portals, setPortals] = useState<LucauaPortal[]>([]);
  const [ghost, setGhost] = useState<LucauaPortalGhost | null>(null);
  const [selection, setSelection] = useState<number | null>(null);
  const [landing, setLanding] = useState(false);
  const [focus, setFocus] = useState<LucauaPortalFocus>(null);

  // Fonte de verdade mutável do tick (o state é só espelho para o render).
  const portalsRef = useRef<LucauaPortal[]>([]);
  const summonsRef = useLatestRef(summons);
  const alliesRef = useLatestRef(allies);
  const petRef = useLatestRef(pet);
  const obstaclesRef = useLatestRef(obstacles ?? NO_OBSTACLES);
  const playSoundRef = useLatestRef(playSound);
  const pushControlsRef = useLatestRef(pushControls);

  // Fluxo (selecting → positioning) e seus dados mutáveis.
  const flowRef = useRef<"idle" | "selecting" | "positioning">("idle");
  const selectRef = useRef(1);
  const ghostRef = useRef<LucauaPortalGhost | null>(null);
  const dirRef = useRef<Record<PortalDirection, boolean>>({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const layerRemoveRef = useRef<(() => void) | null>(null);

  // Travessia: ids desarmados até saírem de todos os portais.
  const disarmedRef = useRef<Set<string>>(new Set());

  // Travas (time + ações do player) e o valor salvo para restaurar depois.
  const locksEngagedRef = useRef(false);
  const savedFreezeRef = useRef(0);

  // Câmera: só atualiza o estado quando muda (evita setState no tick parado).
  const focusingRef = useRef(false);

  // Visual de queda por atravessar um portal aéreo.
  const landingEngagedRef = useRef(false);
  const landingUntilRef = useRef(0);
  const landingShownRef = useRef(false);

  const counterRef = useRef(0);

  const { usable: guardUsable } = useSkillGuard({
    player,
    character: "lucaua",
    freezeActionsUntilRef,
    disabledRef,
    isPausedRef,
    battleEndedRef,
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  const commitPortals = useCallback((next: LucauaPortal[]) => {
    portalsRef.current = next;
    setPortals(next);
  }, []);

  function bodyHeight(): number {
    return PLAYER_SIZE / PLAYER_SPRITE_DIVISOR;
  }

  /**
   * `y` da âncora do portal no ponto `x`.
   *
   * O chão é sondado pela posição do player (é quem lança e está de pé): o
   * `getGroundAtX` procura a superfície que contém os pés, então usar um `y`
   * arbitrário devolveria o piso padrão em vez da plataforma certa.
   */
  function resolvePortalY(
    kind: LucauaPortalKind,
    x: number,
    freeY: number,
  ): number {
    const ground = getGroundAtX(
      player.groundY,
      x,
      obstaclesRef.current,
    );
    if (kind === "air") {
      return Math.max(0, ground - LucauaPortalConstants.AIR_HEIGHT);
    }
    if (kind === "ground") return ground;
    // Frontal: flutua livre, mas nunca abaixo do chão ou acima do topo.
    return Math.max(0, Math.min(ground, freeY));
  }

  function overlapsPortal(
    x: number,
    feetY: number,
    portal: LucauaPortal,
  ): boolean {
    if (Math.abs(x - portal.x) > LucauaPortalConstants.TRIGGER_HALF_X) {
      return false;
    }
    return (
      Math.abs(feetY - portal.y) <= LucauaPortalConstants.TRIGGER_HALF_Y
    );
  }

  /**
   * Decide a travessia de uma entidade, cuidando do "armado/desarmado".
   * Pura em relação ao React: só mexe no `disarmedRef` (não é state updater).
   */
  function pickWarp(id: string, x: number, feetY: number): PortalWarp | null {
    const list = portalsRef.current;
    if (list.length < LucauaPortalConstants.MAX_PORTALS) return null;

    const a = list[0];
    const b = list[1];
    if (!a || !b) return null;
    if (a.phase !== "placed" || b.phase !== "placed") return null;

    const inA = overlapsPortal(x, feetY, a);
    const inB = overlapsPortal(x, feetY, b);

    if (!inA && !inB) {
      disarmedRef.current.delete(id);
      return null;
    }
    if (disarmedRef.current.has(id)) return null;

    disarmedRef.current.add(id);
    return inA ? { dest: b, source: a } : { dest: a, source: b };
  }

  /**
   * Chão sob um portal aéreo. O destino fica `AIR_HEIGHT` acima da superfície
   * em que o portal foi fincado, então sondar a partir do próprio destino não
   * acharia o piso (o `feetY` ficaria no ar); a partir de `dest.y + AIR_HEIGHT`
   * o `getGroundAtX` reconhece a plataforma que contém os pés.
   */
  function groundUnderAir(dest: LucauaPortal): number {
    return getGroundAtX(
      dest.y + LucauaPortalConstants.AIR_HEIGHT + 2,
      dest.x,
      obstaclesRef.current,
    );
  }

  /** Posição final de uma entidade depois de atravessar (nunca no céu). */
  function warpPosition(warp: PortalWarp): { x: number; y: number } {
    const dest = warp.dest;
    if (dest.kind === "air") {
      return { x: dest.x, y: groundUnderAir(dest) };
    }
    return { x: dest.x, y: dest.y };
  }

  // ── Travas ─────────────────────────────────────────────────────────────────

  function engageLocks(now: number) {
    if (!locksEngagedRef.current) {
      savedFreezeRef.current = freezeActionsUntilRef.current;
      locksEngagedRef.current = true;
    }
    freezeActionsUntilRef.current = Number.POSITIVE_INFINITY;
    timeRef.current = applyTime(
      timeRef.current,
      {
        id: PORTAL_TIME_ID,
        kinds: ALL_TIME_KINDS,
        exempt: [],
        speed: 0,
        cooldown: 1,
        // Renovado a cada tick; se o tick parar, o congelamento expira sozinho.
        durationMs: LucauaPortalConstants.TICK_MS * 20,
      },
      now,
    );
  }

  function releaseLocks() {
    if (!locksEngagedRef.current) return;
    locksEngagedRef.current = false;
    freezeActionsUntilRef.current = savedFreezeRef.current;
    timeRef.current = clearTime(timeRef.current, PORTAL_TIME_ID);
  }

  // ── Fluxo ──────────────────────────────────────────────────────────────────

  function endFlow() {
    if (flowRef.current === "idle") return;
    flowRef.current = "idle";
    ghostRef.current = null;
    setGhost(null);
    setSelection(null);
    dirRef.current = { up: false, down: false, left: false, right: false };
    if (layerRemoveRef.current) {
      layerRemoveRef.current();
      layerRemoveRef.current = null;
    }
    const flying = portalsRef.current.some((p) => p.phase === "flying");
    if (!flying) releaseLocks();
  }

  function undoLast() {
    const list = portalsRef.current;
    let index = -1;
    for (let i = list.length - 1; i >= 0; i--) {
      const portal = list[i];
      if (portal && portal.phase === "placed") {
        index = i;
        break;
      }
    }
    if (index < 0) return;

    const removed = list[index];
    if (!removed) return;

    commitPortals(list.filter((_, i) => i !== index));
    disarmedRef.current.clear();
    if (removed.cost > 0) battleManaRef.current?.restoreMana(removed.cost);
    playSoundRef.current("closeMenu");
  }

  function confirmSelection() {
    const kind = LUCAUA_PORTAL_KINDS[selectRef.current] ?? "default";
    const x = Math.max(
      BATTLE_LIMITS.minX,
      Math.min(player.x, BATTLE_LIMITS.maxX),
    );
    const y = resolvePortalY(kind, x, player.y);
    flowRef.current = "positioning";
    ghostRef.current = { kind, x, y };
    setGhost({ kind, x, y });
    setSelection(null);
    playSoundRef.current("selectMenu");
  }

  function moveGhost() {
    const current = ghostRef.current;
    if (!current) return;
    const dir = dirRef.current;
    const dx = (dir.right ? 1 : 0) - (dir.left ? 1 : 0);
    const dy = (dir.down ? 1 : 0) - (dir.up ? 1 : 0);
    if (dx === 0 && dy === 0) return;

    const x = Math.max(
      BATTLE_LIMITS.minX,
      Math.min(
        current.x + dx * LucauaPortalConstants.MOVE_PX,
        BATTLE_LIMITS.maxX,
      ),
    );
    const freeY =
      current.kind === "default"
        ? current.y + dy * LucauaPortalConstants.MOVE_PX
        : current.y;
    const y = resolvePortalY(current.kind, x, freeY);
    ghostRef.current = { kind: current.kind, x, y };
    setGhost({ kind: current.kind, x, y });
  }

  function placePortal() {
    const target = ghostRef.current;
    if (!target) {
      endFlow();
      return;
    }

    const mana = battleManaRef.current;
    const max = mana?.playerMaxMana ?? 0;
    const cost = Math.ceil(max * LucauaPortalConstants.COST_RATIO);
    if (cost > 0 && mana && !mana.consumeMana(cost)) {
      endFlow();
      return;
    }

    const handY = player.y - bodyHeight() * 0.55;
    const portal: LucauaPortal = {
      id: `${PORTAL_TIME_ID}-${counterRef.current++}`,
      kind: target.kind,
      phase: "flying",
      x: player.x,
      y: handY,
      startX: player.x,
      startY: handY,
      targetX: target.x,
      targetY: target.y,
      startTime: Date.now(),
      cost,
    };

    commitPortals([...portalsRef.current, portal]);
    playSoundRef.current("blink");
    endFlow();
  }

  function confirmInput() {
    if (flowRef.current === "selecting") {
      confirmSelection();
    } else if (flowRef.current === "positioning") {
      placePortal();
    }
  }

  function cancelInput() {
    endFlow();
  }

  function handleDir(direction: PortalDirection, pressed: boolean) {
    if (flowRef.current === "selecting") {
      // Guarda a direção mesmo durante a seleção: o jogador costuma manter o
      // direcional pressionado ao confirmar, e sem isso o fantasma só andaria
      // depois de soltar e apertar de novo (o joystick é edge-based).
      dirRef.current[direction] = pressed;
      if (pressed && (direction === "left" || direction === "right")) {
        const total = LUCAUA_PORTAL_KINDS.length;
        const delta = direction === "left" ? -1 : 1;
        selectRef.current = (selectRef.current + delta + total) % total;
        setSelection(selectRef.current);
      }
      return;
    }
    if (flowRef.current !== "positioning") return;
    dirRef.current[direction] = pressed;
  }

  function clickPortal() {
    if (flowRef.current !== "idle") return;
    const list = portalsRef.current;
    if (list.length >= LucauaPortalConstants.MAX_PORTALS) {
      undoLast();
      return;
    }
    if (!usableRef.current) return;
    const now = Date.now();
    flowRef.current = "selecting";
    selectRef.current = 1;
    setSelection(1);
    engageLocks(now);
    playSoundRef.current("blink");

    const layer: GameControlLayer = {
      onConfirm: () => {
        confirmInputRef.current();
        return true;
      },
      onConfirmRelease: () => {},
      onCancel: () => {
        cancelInputRef.current();
        return true;
      },
      onCancelRelease: () => {},
      onLeft: () => {
        handleDirRef.current("left", true);
        return true;
      },
      onRight: () => {
        handleDirRef.current("right", true);
        return true;
      },
      onUp: () => {
        handleDirRef.current("up", true);
        return true;
      },
      onDown: () => {
        handleDirRef.current("down", true);
        return true;
      },
      onLeftRelease: () => {
        handleDirRef.current("left", false);
      },
      onRightRelease: () => {
        handleDirRef.current("right", false);
      },
      onUpRelease: () => {
        handleDirRef.current("up", false);
      },
      onDownRelease: () => {
        handleDirRef.current("down", false);
      },
      blockGlobalOpen: true,
    };

    layerRemoveRef.current = pushControlsRef.current(layer);
  }

  /**
   * Escolha pelo card do modal: fixa o tipo e já entra no posicionamento. O
   * jogador segue com o joystick e confirma com o ataque.
   */
  function pickPortal(index: number) {
    if (flowRef.current !== "selecting") return;
    selectRef.current = index;
    confirmSelection();
  }

  // ── Teleporte ──────────────────────────────────────────────────────────────

  function runTeleports(now: number) {
    const playerWarp = pickWarp("player", player.x, player.y);
    if (playerWarp) {
      const inSky = playerWarp.dest.kind === "air";
      const ground = inSky
        ? groundUnderAir(playerWarp.dest)
        : playerWarp.dest.y;
      setPlayer((prev) => ({
        ...prev,
        x: playerWarp.dest.x,
        y: playerWarp.dest.y,
        groundY: inSky ? ground : playerWarp.dest.y,
        velY: 0,
        state: inSky ? "falling" : prev.state,
      }));
      if (playerWarp.source.kind === "air" || playerWarp.dest.kind === "air") {
        landingEngagedRef.current = true;
        landingUntilRef.current = now + LucauaPortalConstants.LANDING_MS;
      }
      playSoundRef.current("emanuelTeleport");
    }

    const npcWarp = pickWarp("npc", npc.x, npc.y);
    if (npcWarp) {
      const position = warpPosition(npcWarp);
      npc.updateNpc(position);
      playSoundRef.current("emanuelTeleport");
    }

    const summonWarps = new Map<string, PortalWarp>();
    for (const summon of summonsRef.current) {
      const warp = pickWarp(`summon:${summon.id}`, summon.x, summon.y);
      if (warp) summonWarps.set(summon.id, warp);
    }
    if (summonWarps.size > 0) {
      setSummons((prev) =>
        prev.map((summon) => {
          const warp = summonWarps.get(summon.id);
          if (!warp) return summon;
          return { ...summon, ...warpPosition(warp) };
        }),
      );
    }

    const allyWarps = new Map<string, PortalWarp>();
    for (const ally of alliesRef.current) {
      const warp = pickWarp(`ally:${ally.id}`, ally.x, ally.y);
      if (warp) allyWarps.set(ally.id, warp);
    }
    if (allyWarps.size > 0) {
      setAllies((prev) =>
        prev.map((ally) => {
          const warp = allyWarps.get(ally.id);
          if (!warp) return ally;
          return { ...ally, ...warpPosition(warp) };
        }),
      );
    }

    const currentPet = petRef.current;
    if (currentPet) {
      const petWarp = pickWarp("pet", currentPet.x, currentPet.y);
      if (petWarp) {
        const position = warpPosition(petWarp);
        setPet((prev) => (prev ? { ...prev, ...position } : prev));
      }
    }
  }

  function updateLanding(now: number) {
    if (!landingEngagedRef.current) return;
    const airborne = player.y < player.groundY - 1;
    const show = airborne || now < landingUntilRef.current;
    if (show !== landingShownRef.current) {
      landingShownRef.current = show;
      setLanding(show);
    }
    if (!show) landingEngagedRef.current = false;
  }

  // ── Tick ───────────────────────────────────────────────────────────────────

  function tick() {
    const now = Date.now();

    if (battleEndedRef.current || isPausedRef.current) {
      endFlow();
      // Sem o tick, um portal em voo ficaria com a câmera presa nele para
      // sempre; solta o foco aqui (o voo retoma e o re-seta ao despausar).
      if (focusingRef.current) {
        focusingRef.current = false;
        setFocus(null);
      }
      return;
    }

    const flyingBefore = portalsRef.current.some((p) => p.phase === "flying");
    if (flyingBefore) {
      const next = portalsRef.current.map((portal) => {
        if (portal.phase !== "flying") return portal;
        const t = Math.min(
          (now - portal.startTime) / LucauaPortalConstants.FLIGHT_MS,
          1,
        );
        if (t >= 1) {
          return {
            ...portal,
            x: portal.targetX,
            y: portal.targetY,
            phase: "placed" as const,
          };
        }
        const eased = 1 - Math.pow(1 - t, 3);
        return {
          ...portal,
          x: portal.startX + (portal.targetX - portal.startX) * eased,
          y: portal.startY + (portal.targetY - portal.startY) * eased,
        };
      });
      commitPortals(next);
    }

    const flying =
      portalsRef.current.find((p) => p.phase === "flying") ?? null;

    if (flying) {
      setFocus({ x: flying.x, y: flying.y });
    } else if (focusingRef.current) {
      setFocus(null);
    }
    focusingRef.current = flying !== null;

    if (flowRef.current === "positioning") moveGhost();

    if (flowRef.current !== "idle" || flying) {
      engageLocks(now);
    } else if (locksEngagedRef.current) {
      releaseLocks();
    }

    if (flowRef.current === "idle" && !flying) runTeleports(now);

    updateLanding(now);
  }

  const tickRef = useLatestRef(tick);

  useEffect(() => {
    const id = setInterval(
      () => tickRef.current(),
      LucauaPortalConstants.TICK_MS,
    );
    return () => clearInterval(id);
  }, [tickRef]);

  // Cleanup: solta a layer e as travas se a batalha desmontar no meio.
  useEffect(() => {
    return () => {
      if (layerRemoveRef.current) {
        layerRemoveRef.current();
        layerRemoveRef.current = null;
      }
      if (locksEngagedRef.current) {
        locksEngagedRef.current = false;
        freezeActionsUntilRef.current = savedFreezeRef.current;
        timeRef.current = clearTime(timeRef.current, PORTAL_TIME_ID);
      }
    };
  }, [freezeActionsUntilRef, timeRef]);

  // ── API ────────────────────────────────────────────────────────────────────

  const maxMana = battleManaRef.current?.playerMaxMana ?? 0;
  const portalCost = Math.ceil(maxMana * LucauaPortalConstants.COST_RATIO);
  const hasEnergy = (battleManaRef.current?.playerMana ?? 0) >= portalCost;
  const full = portals.length >= LucauaPortalConstants.MAX_PORTALS;
  const usable = full || (guardUsable && hasEnergy);

  const clickRef = useLatestRef(clickPortal);
  const pickRef = useLatestRef(pickPortal);
  const usableRef = useLatestRef(usable);

  const click = useCallback(() => clickRef.current(), [clickRef]);
  const pick = useCallback(
    (index: number) => pickRef.current(index),
    [pickRef],
  );

  const confirmInputRef = useLatestRef(confirmInput);
  const cancelInputRef = useLatestRef(cancelInput);
  const handleDirRef = useLatestRef(handleDir);

  return {
    lucauaPortals: portals,
    lucauaPortalGhost: ghost,
    lucauaPortalSelection: selection,
    lucauaPortalLanding: landing,
    lucauaPortalFocus: focus,
    lucauaPortalClick: click,
    lucauaPortalPick: pick,
    lucauaPortalUsable: usable,
    lucauaPortalCount: portals.length,
    lucauaPortalCost: portalCost,
    lucauaPortalMaxPortals: LucauaPortalConstants.MAX_PORTALS,
  };
}
