import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";

import { useLatestRef } from "@/hooks/useLatestRef";
import { useSkillGuard } from "@/hooks/battle/player/characters/useSkillGuard";

import {
  advancePortalFlight,
  findFlyingPortal,
} from "@/gameRules/battle/characters/lucaua/portalFlight";
import { buildTravelLockSpec } from "@/gameRules/battle/characters/lucaua/portalWarpRules";
import { type TimeEffect } from "@/gameRules/battle/time";
import { LucauaPortalConstants } from "@/data/characters/lucaua";
import { usePortalFlow } from "./usePortalFlow";
import { usePortalLocks } from "./usePortalLocks";
import { usePortalTravel } from "./usePortalTravel";

import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { PlaySound } from "@/utils/types/audio";
import type { NPCBattleState, SummonedNpc } from "@/utils/types/npc/npc";
import type { PetState } from "@/hooks/battle/player/pets/usePet";
import type {
  LucauaPortal,
  LucauaPortalFocus,
  LucauaPortalWarpFn,
} from "@/utils/types/character/lucaua";
import type { BattleObstacle } from "@/utils/types/maps/battle";

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
  playSound: PlaySound;
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
 * Congelamento em duas frentes: o fluxo de colocação (e o voo do portal)
 * congela o mundo inteiro pelo efeito de time (`freeze`), renovado a cada tick,
 * travando também as ações do player pelo `freezeActionsUntilRef` (ele não faz
 * parte dos `TimeKind`); a travessia, por sua vez, congela **só** quem está
 * atravessando — as outras entidades seguem vivas enquanto a que cai é
 * renderizada no outro portal, e o player só tem as ações travadas se for ele
 * quem cai.
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
 *
 * A lógica vive em sub-hooks coesos: `usePortalFlow` (seleção/posicionamento),
 * `usePortalTravel` (teleporte/quedas) e `usePortalLocks` (as travas de tempo e
 * de ações). Aqui só ficam o estado dos portais, o tick e a API.
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
  // ── Estado de render ───────────────────────────────────────────────────────
  const [portals, setPortals] = useState<LucauaPortal[]>([]);
  const [focus, setFocus] = useState<LucauaPortalFocus>(null);

  // Fonte de verdade mutável do tick (o state é só espelho para o render).
  const portalsRef = useRef<LucauaPortal[]>([]);
  const summonsRef = useLatestRef(summons);
  const alliesRef = useLatestRef(allies);
  const petRef = useLatestRef(pet);
  const obstaclesRef = useLatestRef(obstacles ?? []);
  const playSoundRef = useLatestRef(playSound);

  // Travessia: ids desarmados até saírem de todos os portais.
  const disarmedRef = useRef<Set<string>>(new Set());

  // Câmera: só atualiza o estado quando muda (evita setState no tick parado).
  const focusingRef = useRef(false);

  const { usable: guardUsable } = useSkillGuard({
    player,
    character: "lucaua",
    freezeActionsUntilRef,
    disabledRef,
    isPausedRef,
    battleEndedRef,
  });

  const { releaseLocks, engageLocks, engageTravelLocks } = usePortalLocks({
    timeRef,
    freezeActionsUntilRef,
  });

  // ── Portais ────────────────────────────────────────────────────────────────

  const commitPortals = useCallback((next: LucauaPortal[]) => {
    portalsRef.current = next;
    setPortals(next);
  }, []);

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

  const {
    travelRef,
    playerTravelRef,
    landing,
    resetTravel,
    runTeleports,
    updateTravel,
    updatePlayerTravel,
    updateLanding,
    warpProjectile,
  } = usePortalTravel({
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
  });

  // ── API (antes do fluxo: o clique lê `usableRef`) ──────────────────────────

  const maxMana = battleManaRef.current?.playerMaxMana ?? 0;
  const portalCost = Math.ceil(maxMana * LucauaPortalConstants.COST_RATIO);
  const hasEnergy = (battleManaRef.current?.playerMana ?? 0) >= portalCost;
  const full = portals.length >= LucauaPortalConstants.MAX_PORTALS;
  const usable = full || (guardUsable && hasEnergy);
  const usableRef = useLatestRef(usable);

  const { ghost, selection, flowRef, endFlow, moveGhost, click, pick } =
    usePortalFlow({
      player,
      portalsRef,
      obstaclesRef,
      playSoundRef,
      battleManaRef,
      usableRef,
      commitPortals,
      engageLocks,
      releaseLocks,
      onUndoLast: undoLast,
      PLAYER_SIZE,
    });

  /**
   * Zera a habilidade para uma nova tentativa: portais, quedas em curso, foco
   * de câmera e travas. O estado do hook **sobrevive** ao retry da batalha (só
   * player/NPC são remontados), então sem isso a nova tentativa recomeçaria com
   * os portais já fincados no mapa.
   */
  function resetPortals() {
    commitPortals([]);
    disarmedRef.current.clear();
    resetTravel();
    endFlow();
    if (focusingRef.current) {
      focusingRef.current = false;
      setFocus(null);
    }
    releaseLocks();
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

    const flyingBefore = findFlyingPortal(portalsRef.current) !== null;
    if (flyingBefore) {
      const next = portalsRef.current.map((portal) =>
        advancePortalFlight(portal, now),
      );
      commitPortals(next);
    }

    const flying = findFlyingPortal(portalsRef.current);

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

    // Fluxo/voo: o mundo para inteiro (o player está montando o par).
    // Travessia: só quem está caindo congela — o resto do mundo segue.
    const playerTraveling = playerTravelRef.current !== null;
    const traveling = playerTraveling || travelRef.current.length > 0;
    if (flowRef.current !== "idle" || flying) {
      engageLocks(now);
    } else if (traveling) {
      engageTravelLocks(
        now,
        buildTravelLockSpec(
          travelRef.current,
          playerTraveling,
          summonsRef.current,
          alliesRef.current,
        ),
      );
    } else {
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
