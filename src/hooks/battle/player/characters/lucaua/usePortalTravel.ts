import { useRef, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";

import {
  advanceEntityTravel,
  groundFallTargetY,
  isPlayerTravelDone,
  landingGround,
} from "@/gameRules/battle/characters/lucaua/portalTravelRules";
import { groundUnder } from "@/gameRules/battle/characters/lucaua/portalGeometry";
import {
  pickProjectileWarp,
  pickWarpDecision,
  projectileWarpKey,
} from "@/gameRules/battle/characters/lucaua/portalWarpRules";
import { LucauaPortalConstants } from "@/data/characters/lucaua";

import type { PetState } from "@/hooks/battle/player/pets/usePet";
import type { PlaySound } from "@/utils/types/audio";
import type { NPCBattleState, SummonedNpc } from "@/utils/types/npc/npc";
import type {
  LucauaPortal,
  LucauaPortalKind,
} from "@/utils/types/character/lucaua";
import type {
  EntityTravel,
  PlayerTravel,
  PortalTravelGroup,
  PortalWarp,
} from "@/utils/types/character/lucaua/portals";
import type { BattleObstacle } from "@/utils/types/maps/battle";

type Props = {
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  npc: {
    x: number;
    y: number;
    updateNpc: (partial: Partial<NPCBattleState>) => void;
  };
  summonsRef: RefObject<SummonedNpc[]>;
  alliesRef: RefObject<SummonedNpc[]>;
  petRef: RefObject<PetState>;
  setSummons: Dispatch<SetStateAction<SummonedNpc[]>>;
  setAllies: Dispatch<SetStateAction<SummonedNpc[]>>;
  setPet: Dispatch<SetStateAction<PetState>>;
  portalsRef: RefObject<LucauaPortal[]>;
  disarmedRef: RefObject<Set<string>>;
  obstaclesRef: RefObject<BattleObstacle[]>;
  playSoundRef: RefObject<PlaySound>;
};

/**
 * Travessia dos portais: teleporte do player, quedas simuladas das demais
 * entidades e warp de projéteis.
 *
 * Cada entidade tem um "armado/desarmado" próprio — depois de atravessar, ela
 * fica desarmada até sair de todos os raios, o que impediria o ping-pong
 * infinito entre dois portais que se sobrepõem.
 *
 * Entrar num portal **terrestre** afunda a entidade (`GROUND_FALL_DEPTH`) antes
 * de cruzar — o player pela gravidade, os demais por queda simulada; e um portal
 * de saída suspenso (frontal/aéreo) derruba a entidade até o chão, nunca a deixa
 * parada na linha do portal.
 */
export function usePortalTravel({
  player,
  setPlayer,
  npc,
  summonsRef,
  alliesRef,
  petRef,
  setSummons,
  setAllies,
  setPet,
  portalsRef,
  disarmedRef,
  obstaclesRef,
  playSoundRef,
}: Props) {
  // Visual de queda por atravessar um portal suspenso.
  const [landing, setLanding] = useState(false);

  // Quedas em curso (afundar no portal terrestre + aterrissar no chão).
  const playerTravelRef = useRef<PlayerTravel | null>(null);
  const travelRef = useRef<EntityTravel[]>([]);

  // Visual de queda por atravessar um portal aéreo.
  const landingEngagedRef = useRef(false);
  const landingUntilRef = useRef(0);
  const landingShownRef = useRef(false);

  // ── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Decide a travessia de uma entidade, cuidando do "armado/desarmado".
   */
  function pickWarp(id: string, x: number, feetY: number): PortalWarp | null {
    const result = pickWarpDecision(
      id,
      x,
      feetY,
      portalsRef.current,
      disarmedRef.current,
    );

    if (result.kind === "disarm") {
      disarmedRef.current.delete(id);
      return null;
    }

    if (result.kind === "arm") {
      disarmedRef.current.add(id);
      return result.warp;
    }

    return null;
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
      setSummons((prev) => prev.map((s) => (s.id === id ? { ...s, x, y } : s)));
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

  /**
   * Zera as quedas e o visual de pouso. Chamado no reset dos portais (retry da
   * batalha): sem isso a nova tentativa recomeçaria com quedas pendentes.
   */
  function resetTravel() {
    playerTravelRef.current = null;
    travelRef.current = [];
    landingEngagedRef.current = false;
    landingShownRef.current = false;
    setLanding(false);
  }

  // ── Teleporte ──────────────────────────────────────────────────────────────

  /**
   * Teleporta o player para o destino. O `groundY` vira o chão sob o destino:
   * se o portal estiver suspenso, o player sai em queda (`falling`) e a própria
   * gravidade o leva ao chão — era o bug de ficar preso na linha do portal.
   */
  function teleportPlayer(dest: LucauaPortal, now: number) {
    const ground = groundUnder(dest, obstaclesRef.current);
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
    playSoundRef.current("portalTeleport");
  }

  /**
   * Inicia a travessia do player. Portal terrestre na origem = afundar
   * `GROUND_FALL_DEPTH` (gravidade) antes de cruzar; os demais cruzam na hora.
   */
  function startPlayerWarp(warp: PortalWarp, now: number) {
    if (warp.source.kind === "ground") {
      const targetY = groundFallTargetY(warp.source);
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
    if (!isPlayerTravelDone(travel, player.y, now)) return;
    playerTravelRef.current = null;
    teleportPlayer(travel.dest, now);
  }

  /**
   * Inicia a travessia de uma entidade não-player. Portal terrestre na origem =
   * queda simulada (o AI **dessa entidade** fica congelado pelo efeito de
   * travessia e esta queda escreve x/y); os demais cruzam na hora e, se o
   * destino estiver suspenso, caem até o chão.
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
        targetY: groundFallTargetY(warp.source),
      });
      return;
    }
    writeEntity(group, id, warp.dest.x, warp.dest.y);
    playSoundRef.current("portalTeleport");
    const ground = landingGround(warp.dest, obstaclesRef.current);
    if (ground !== null) {
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
      const step = advanceEntityTravel(travel, obstaclesRef.current);
      writeEntity(travel.group, travel.id, step.x, step.y);
      if (step.crossed) playSoundRef.current("portalTeleport");
      if (step.next) remaining.push(step.next);
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
        startEntityWarp("summon", summon.id, key, summon.x, summon.y, warp);
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
        const petY = Math.max(
          petWarp.dest.y,
          groundUnder(petWarp.dest, obstaclesRef.current),
        );
        writeEntity("pet", "pet", petWarp.dest.x, petY);
        playSoundRef.current("portalTeleport");
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
    const key = projectileWarpKey(id);
    const result = pickProjectileWarp(
      id,
      x,
      y,
      portalsRef.current,
      disarmedRef.current,
    );

    if (result.kind === "disarm") {
      disarmedRef.current.delete(key);
      return null;
    }

    if (result.kind === "warp") {
      disarmedRef.current.add(key);
      return { x: result.dest.x, y: result.dest.y, kind: result.dest.kind };
    }

    return null;
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

  return {
    travelRef,
    playerTravelRef,
    landing,
    resetTravel,
    runTeleports,
    updateTravel,
    updatePlayerTravel,
    updateLanding,
    warpProjectile,
  };
}
