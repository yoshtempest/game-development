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
  LucauaPortalWarpFn,
} from "@/utils/types/character/lucaua";

/** Direção que o joystick pode empurrar o fantasma/seletor. */
type PortalDirection = "up" | "down" | "left" | "right";

/** Par de portais que uma travessia conecta (origem → destino). */
type PortalWarp = { dest: LucauaPortal; source: LucauaPortal };

/** Grupo de entidade que atravessa (define qual setter escreve a posição). */
type PortalTravelGroup = "npc" | "summon" | "ally" | "pet";

/**
 * Queda em curso de uma entidade não-player. A posição é dirigida aqui (não
 * pelo AI, que fica congelado pelo efeito de time): `descend` afunda do portal
 * terrestre até `targetY`; `land` cai do destino suspenso até o chão.
 */
type EntityTravel = {
  /** Id de travessia (mesma chave do `disarmedRef`, ex.: `summon:<id>`). */
  key: string;
  group: PortalTravelGroup;
  id: string;
  dest: LucauaPortal;
  phase: "descend" | "land";
  x: number;
  y: number;
  vy: number;
  targetY: number;
};

/** Queda em curso do player ao entrar num portal terrestre. */
type PlayerTravel = {
  dest: LucauaPortal;
  targetY: number;
  startTime: number;
};

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
  /**
   * Saída do warp de projéteis: o hook publica aqui a função que os loops de
   * projétil (NPC e energia do lucaua) chamam para atravessar os portais.
   */
  portalWarpRef: RefObject<LucauaPortalWarpFn | null>;
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
 *
 * Travessia com queda: entrar num portal **terrestre** afunda a entidade
 * (`GROUND_FALL_DEPTH`) antes de cruzar — o player pela gravidade, os demais por
 * queda simulada; e um portal de saída suspenso (frontal/aéreo) derruba a
 * entidade até o chão, nunca a deixa parada na linha do portal. Projéteis
 * também cruzam (o warp é publicado em `portalWarpRef`).
 *
 * O portal terrestre é um buraco: quem anda com os pés na linha (ou cai) entra,
 * mas pular por cima escapa — por isso a zona de entrada dele só abre uma
 * margem curta acima da linha (`GROUND_ENTER_MARGIN`), ao contrário dos
 * suspensos, que capturam numa faixa simétrica.
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
  portalWarpRef,
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

  // Quedas em curso (afundar no portal terrestre + aterrissar no chão).
  const playerTravelRef = useRef<PlayerTravel | null>(null);
  const travelRef = useRef<EntityTravel[]>([]);

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
    if (portal.kind === "ground") {
      // O portal deitado é um buraco no chão: só captura quem está com os pés
      // na linha (andando) ou abaixo dela (caindo). A margem pequena acima dá
      // a saída do pulo — o ápice do pulo simples passa de 128px, muito além
      // dela, então dá para pular por cima sem cair dentro.
      const above = portal.y - LucauaPortalConstants.GROUND_ENTER_MARGIN;
      return (
        feetY >= above &&
        feetY <= portal.y + LucauaPortalConstants.TRIGGER_HALF_Y
      );
    }
    return Math.abs(feetY - portal.y) <= LucauaPortalConstants.TRIGGER_HALF_Y;
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
   * Chão sob a âncora de um portal. O portal terrestre fica **no** chão (a
   * própria âncora); os flutuantes (frontal/aéreo) ficam acima dele, então a
   * sonda desce `AIR_HEIGHT` para o `getGroundAtX` reconhecer a plataforma que
   * contém os pés — sondar a partir do próprio destino cairia no ar.
   */
  function groundUnder(dest: LucauaPortal): number {
    if (dest.kind === "ground") return dest.y;
    return getGroundAtX(
      dest.y + LucauaPortalConstants.AIR_HEIGHT + 2,
      dest.x,
      obstaclesRef.current,
    );
  }

  /** Escreve a posição de uma entidade não-player, pelo grupo a que pertence. */
  function writeEntity(
    group: PortalTravelGroup,
    id: string,
    x: number,
    y: number,
  ) {
    if (group === "npc") {
      npc.updateNpc({ x, y });
    } else if (group === "summon") {
      setSummons((prev) =>
        prev.map((s) => (s.id === id ? { ...s, x, y } : s)),
      );
    } else if (group === "ally") {
      setAllies((prev) => prev.map((s) => (s.id === id ? { ...s, x, y } : s)));
    } else {
      setPet((prev) => (prev ? { ...prev, x, y } : prev));
    }
  }

  /** Há uma queda em curso para essa chave de travessia? */
  function isTraveling(key: string): boolean {
    return travelRef.current.some((t) => t.key === key);
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

  /**
   * Zera a habilidade para uma nova tentativa: portais, quedas em curso, foco
   * de câmera e travas. O estado do hook **sobrevive** ao retry da batalha (só
   * player/NPC são remontados), então sem isso a nova tentativa recomeçaria com
   * os portais já fincados no mapa.
   */
  function resetPortals() {
    commitPortals([]);
    disarmedRef.current.clear();
    playerTravelRef.current = null;
    travelRef.current = [];
    landingEngagedRef.current = false;
    landingShownRef.current = false;
    setLanding(false);
    endFlow();
    if (focusingRef.current) {
      focusingRef.current = false;
      setFocus(null);
    }
    releaseLocks();
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

  /**
   * Teleporta o player para o destino. O `groundY` vira o chão sob o destino:
   * se o portal estiver suspenso, o player sai em queda (`falling`) e a própria
   * gravidade o leva ao chão — era o bug de ficar preso na linha do portal.
   */
  function teleportPlayer(dest: LucauaPortal, now: number) {
    const ground = groundUnder(dest);
    const aboveGround = dest.y < ground - 1;
    setPlayer((prev) => ({
      ...prev,
      x: dest.x,
      y: dest.y,
      groundY: ground,
      velY: 0,
      state: aboveGround ? "falling" : prev.state,
    }));
    if (aboveGround) {
      landingEngagedRef.current = true;
      landingUntilRef.current = now + LucauaPortalConstants.LANDING_MS;
    }
    playSoundRef.current("emanuelTeleport");
  }

  /**
   * Inicia a travessia do player. Portal terrestre na origem = afundar
   * `GROUND_FALL_DEPTH` (gravidade) antes de cruzar; os demais cruzam na hora.
   */
  function startPlayerWarp(warp: PortalWarp, now: number) {
    if (warp.source.kind === "ground") {
      const targetY = warp.source.y + LucauaPortalConstants.GROUND_FALL_DEPTH;
      playerTravelRef.current = { dest: warp.dest, targetY, startTime: now };
      // `groundY` no fundo do buraco: a gravidade desce até lá e "aterra".
      setPlayer((prev) => ({
        ...prev,
        groundY: targetY,
        velY: 0,
        state: "falling",
      }));
      return;
    }
    teleportPlayer(warp.dest, now);
  }

  /** Conclui a travessia do player quando o corpo chega ao fundo do buraco. */
  function updatePlayerTravel(now: number) {
    const travel = playerTravelRef.current;
    if (!travel) return;
    const reached = player.y >= travel.targetY - 1;
    const timedOut =
      now - travel.startTime >= LucauaPortalConstants.FALL_MAX_MS;
    if (!reached && !timedOut) return;
    playerTravelRef.current = null;
    teleportPlayer(travel.dest, now);
  }

  /**
   * Inicia a travessia de uma entidade não-player. Portal terrestre na origem =
   * queda simulada (o AI fica congelado e esta queda escreve x/y); os demais
   * cruzam na hora e, se o destino estiver suspenso, caem até o chão.
   */
  function startEntityWarp(
    group: PortalTravelGroup,
    id: string,
    key: string,
    fromX: number,
    fromY: number,
    warp: PortalWarp,
  ) {
    if (warp.source.kind === "ground") {
      travelRef.current.push({
        key,
        group,
        id,
        dest: warp.dest,
        phase: "descend",
        x: fromX,
        y: fromY,
        vy: 0,
        targetY: warp.source.y + LucauaPortalConstants.GROUND_FALL_DEPTH,
      });
      return;
    }
    writeEntity(group, id, warp.dest.x, warp.dest.y);
    playSoundRef.current("emanuelTeleport");
    const ground = groundUnder(warp.dest);
    if (warp.dest.y < ground - 1) {
      travelRef.current.push({
        key,
        group,
        id,
        dest: warp.dest,
        phase: "land",
        x: warp.dest.x,
        y: warp.dest.y,
        vy: 0,
        targetY: ground,
      });
    }
  }

  /** Avança as quedas em curso; a travessia cruza ao fim do afundamento. */
  function updateTravel() {
    const list = travelRef.current;
    if (list.length === 0) return;
    const remaining: EntityTravel[] = [];
    for (const travel of list) {
      travel.vy += LucauaPortalConstants.FALL_GRAVITY;
      travel.y = Math.min(travel.y + travel.vy, travel.targetY);
      if (travel.y < travel.targetY) {
        writeEntity(travel.group, travel.id, travel.x, travel.y);
        remaining.push(travel);
        continue;
      }
      if (travel.phase === "descend") {
        writeEntity(travel.group, travel.id, travel.dest.x, travel.dest.y);
        playSoundRef.current("emanuelTeleport");
        const ground = groundUnder(travel.dest);
        if (travel.dest.y < ground - 1) {
          travel.phase = "land";
          travel.x = travel.dest.x;
          travel.y = travel.dest.y;
          travel.vy = 0;
          travel.targetY = ground;
          remaining.push(travel);
        }
        continue;
      }
      // `land`: já pousou no chão do destino.
      writeEntity(travel.group, travel.id, travel.x, travel.targetY);
    }
    travelRef.current = remaining;
  }

  function runTeleports(now: number) {
    if (!playerTravelRef.current) {
      const playerWarp = pickWarp("player", player.x, player.y);
      if (playerWarp) startPlayerWarp(playerWarp, now);
    }

    if (!isTraveling("npc")) {
      const npcWarp = pickWarp("npc", npc.x, npc.y);
      if (npcWarp) startEntityWarp("npc", "npc", "npc", npc.x, npc.y, npcWarp);
    }

    for (const summon of summonsRef.current) {
      const key = `summon:${summon.id}`;
      if (isTraveling(key)) continue;
      const warp = pickWarp(key, summon.x, summon.y);
      if (warp) {
        startEntityWarp(
          "summon",
          summon.id,
          key,
          summon.x,
          summon.y,
          warp,
        );
      }
    }

    for (const ally of alliesRef.current) {
      const key = `ally:${ally.id}`;
      if (isTraveling(key)) continue;
      const warp = pickWarp(key, ally.x, ally.y);
      if (warp) {
        startEntityWarp("ally", ally.id, key, ally.x, ally.y, warp);
      }
    }

    // Pet: o tick dele é o único que **não** consulta a regra de time (só
    // `isPaused`), então uma queda simulada brigaria com o próprio "seguir o
    // player". Ele atravessa na hora e já sai no chão do destino — nunca preso
    // na linha de um portal suspenso.
    const currentPet = petRef.current;
    if (currentPet) {
      const petWarp = pickWarp("pet", currentPet.x, currentPet.y);
      if (petWarp) {
        const petY = Math.max(petWarp.dest.y, groundUnder(petWarp.dest));
        writeEntity("pet", "pet", petWarp.dest.x, petY);
        playSoundRef.current("emanuelTeleport");
      }
    }
  }

  /**
   * Warp de projétil: os loops de projétil (NPC e energia do lucaua) chamam a
   * cada tick com o centro do projétil. Ele reaparece no outro portal e devolve
   * o `kind` de saída — quem decide a nova direção é o chamador
   * (`getPortalExitDirection`); fica desarmado até sair das duas zonas (evita
   * ping-pong).
   */
  function warpProjectile(
    id: string,
    x: number,
    y: number,
  ): { x: number; y: number; kind: LucauaPortalKind } | null {
    const list = portalsRef.current;
    if (list.length < LucauaPortalConstants.MAX_PORTALS) return null;
    const a = list[0];
    const b = list[1];
    if (!a || !b || a.phase !== "placed" || b.phase !== "placed") return null;

    const key = `projectile:${id}`;
    const inA = overlapsPortal(x, y, a);
    const inB = overlapsPortal(x, y, b);
    if (!inA && !inB) {
      disarmedRef.current.delete(key);
      return null;
    }
    if (disarmedRef.current.has(key)) return null;

    disarmedRef.current.add(key);
    const dest = inA ? b : a;
    return { x: dest.x, y: dest.y, kind: dest.kind };
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

    if (flowRef.current === "idle" && !flying) runTeleports(now);
    updatePlayerTravel(now);
    updateTravel();

    const traveling =
      playerTravelRef.current !== null || travelRef.current.length > 0;
    if (flowRef.current !== "idle" || flying || traveling) {
      engageLocks(now);
    } else if (locksEngagedRef.current) {
      releaseLocks();
    }

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

  // Publica o warp de projéteis para os loops de projétil (NPC e energia). O
  // wrapper estável lê o `warpProjectile` atual a cada chamada, que por sua vez
  // consulta `portalsRef`/`disarmedRef` na hora — nada de closure velho.
  const warpProjectileRef = useLatestRef(warpProjectile);
  useEffect(() => {
    portalWarpRef.current = (id, x, y) => warpProjectileRef.current(id, x, y);
    return () => {
      portalWarpRef.current = null;
    };
  }, [portalWarpRef, warpProjectileRef]);

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

  // Estável para o retry da batalha: o `handleRetry` do fluxo de derrota entra
  // na lista de deps dele, então uma função nova a cada render o recriaria.
  const resetPortalsRef = useLatestRef(resetPortals);
  const resetPortalsStable = useCallback(
    () => resetPortalsRef.current(),
    [resetPortalsRef],
  );

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
    lucauaResetPortals: resetPortalsStable,
  };
}
