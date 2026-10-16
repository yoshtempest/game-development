import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { useGameControls } from "@/contexts/GameControlsContext";
import { useLatestRef } from "@/hooks/useLatestRef";

import { findFlyingPortal } from "@/gameRules/battle/characters/lucaua/portalFlight";
import {
  bodyHeight,
  resolvePortalY,
} from "@/gameRules/battle/characters/lucaua/portalGeometry";
import {
  clampPortalX,
  cyclePortalSelection,
  freeGhostY,
} from "@/gameRules/battle/characters/lucaua/portalPlacementRules";
import {
  LUCAUA_PORTAL_KINDS,
  LucauaPortalConstants,
} from "@/data/characters/lucaua";
import { PORTAL_TIME_ID } from "./usePortalLocks";

import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { PlaySound } from "@/utils/types/audio";
import type { GameControlLayer } from "@/utils/types/player/controls";
import type {
  LucauaPortal,
  LucauaPortalGhost,
} from "@/utils/types/character/lucaua";
import type {
  PortalDirection,
  PortalFlowPhase,
} from "@/utils/types/character/lucaua/portals";
import type { BattleObstacle } from "@/utils/types/maps/battle";

type Props = {
  player: Player;
  portalsRef: RefObject<LucauaPortal[]>;
  obstaclesRef: RefObject<BattleObstacle[]>;
  playSoundRef: RefObject<PlaySound>;
  battleManaRef: RefObject<BattleManaApi | null>;
  /** A habilidade está utilizável agora (energia + guard) — lido no clique. */
  usableRef: RefObject<boolean>;
  commitPortals: (next: LucauaPortal[]) => void;
  engageLocks: (now: number) => void;
  releaseLocks: () => void;
  /** Desfaz o último portal fincado (o botão vira undo com o par completo). */
  onUndoLast: () => void;
  PLAYER_SIZE: number;
};

/**
 * Fluxo de colocação do portal (Energia Dimensional): o toque no botão abre o
 * seletor de tipo, o direcional destaca um tipo e o input de ataque confirma;
 * o fantasma é então posicionado pelo joystick e o ataque de novo finca o
 * portal. `selecting → positioning → idle` é a máquina de estados.
 *
 * A camada de controles empurrada no início do fluxo captura o input (teclado e
 * toque) e é desempilhada ao sair — o cleanup de unmount solta a camada se a
 * batalha desmontar no meio, para não vazar input para o resto do app.
 */
export function usePortalFlow({
  player,
  portalsRef,
  obstaclesRef,
  playSoundRef,
  battleManaRef,
  usableRef,
  commitPortals,
  engageLocks,
  releaseLocks,
  onUndoLast,
  PLAYER_SIZE,
}: Props) {
  const { pushControls } = useGameControls();

  const [ghost, setGhost] = useState<LucauaPortalGhost | null>(null);
  const [selection, setSelection] = useState<number | null>(null);

  // Fase e dados mutáveis do fluxo (o state é só espelho para o render).
  const flowRef = useRef<PortalFlowPhase>("idle");
  const selectRef = useRef(1);
  const ghostRef = useRef<LucauaPortalGhost | null>(null);
  const dirRef = useRef<Record<PortalDirection, boolean>>({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const layerRemoveRef = useRef<(() => void) | null>(null);
  const counterRef = useRef(0);

  const pushControlsRef = useLatestRef(pushControls);

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
    // Se um portal ainda voa, o mundo continua congelado pelo voo; o tick
    // reengata a trava e só solta quando ele fincar.
    if (findFlyingPortal(portalsRef.current) === null) releaseLocks();
  }

  function confirmSelection() {
    const kind = LUCAUA_PORTAL_KINDS[selectRef.current] ?? "default";
    const x = clampPortalX(player.x);
    const y = resolvePortalY(
      kind,
      x,
      player.y,
      player.groundY,
      obstaclesRef.current,
    );
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

    const x = clampPortalX(current.x + dx * LucauaPortalConstants.MOVE_PX);
    const freeY = freeGhostY(current.kind, current.y, dy);
    const y = resolvePortalY(
      current.kind,
      x,
      freeY,
      player.groundY,
      obstaclesRef.current,
    );
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

    const handY = player.y - bodyHeight(PLAYER_SIZE) * 0.55;
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
        const delta = direction === "left" ? -1 : 1;
        selectRef.current = cyclePortalSelection(
          selectRef.current,
          delta,
          LUCAUA_PORTAL_KINDS.length,
        );
        setSelection(selectRef.current);
      }
      return;
    }
    if (flowRef.current !== "positioning") return;
    dirRef.current[direction] = pressed;
  }

  const confirmInputRef = useLatestRef(confirmInput);
  const cancelInputRef = useLatestRef(cancelInput);
  const handleDirRef = useLatestRef(handleDir);

  function clickPortal() {
    if (flowRef.current !== "idle") return;
    const list = portalsRef.current;
    if (list.length >= LucauaPortalConstants.MAX_PORTALS) {
      onUndoLast();
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

  const clickRef = useLatestRef(clickPortal);
  const pickRef = useLatestRef(pickPortal);

  const click = useCallback(() => clickRef.current(), [clickRef]);
  const pick = useCallback(
    (index: number) => pickRef.current(index),
    [pickRef],
  );

  // Unmount: solta a camada de controles se a batalha desmontar no meio do
  // fluxo. Sem isso a pilha de input ficaria com a camada do portal no topo.
  useEffect(() => {
    return () => {
      if (layerRemoveRef.current) {
        layerRemoveRef.current();
        layerRemoveRef.current = null;
      }
    };
  }, []);

  return { ghost, selection, flowRef, endFlow, moveGhost, click, pick };
}
