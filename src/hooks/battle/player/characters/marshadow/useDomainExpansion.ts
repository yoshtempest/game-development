import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { applyVampirism } from "@/gameRules/battle/vampirism/applyVampirism";
import type { VampirismStats } from "@/gameRules/battle/vampirism/applyVampirism";
import { getProjectileCenter } from "@/gameRules/npc/projectile/projectileDamage";
import {
  applyTime,
  clearTime,
  freezeWorldSpec,
  type TimeEffect,
} from "@/gameRules/battle/time";
import { BATTLE_LIMITS } from "@/gameRules/movement/constants";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import type { SoundId } from "@/utils/audio/soundId";
import type { NPCBattleState, SummonedNpc } from "@/utils/types/npc/npc";
import { useSkillGuard } from "@/hooks/battle/player/characters/useSkillGuard";
import { usePausableTimers } from "@/hooks/battle/utilities/usePausableTimers";
import type { PausableTimerHandle } from "@/hooks/battle/utilities/usePausableTimers";
import { useMenuPauseShift } from "@/hooks/battle/utilities/useMenuPauseShift";
import { DOMAIN_SHATTER_MS } from "@/data/characters/domainExpansions";
import {
  DOMAIN_EXPANSION_BLINK_IN_MS,
  DOMAIN_EXPANSION_BLINK_OUT_MS,
  DOMAIN_EXPANSION_DISINTEGRATION_MS,
  DOMAIN_EXPANSION_MUGETSU_MS,
  DOMAIN_EXPANSION_PRE_MS,
  DOMAIN_EXPANSION_TIME_ID,
  DOMAIN_EXPANSION_TOTAL_MS,
  DOMAIN_EXPANSION_SWEEP_SPEED,
} from "@/data/characters/marcelo/marshadowDomainExpansion";
import type {
  MugetsuBlink,
  MugetsuDisintegrationTarget,
  MugetsuSweep,
} from "@/utils/types/battle/mugetsu";

type Props = {
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  /** NPC principal (x/y via latestRef; updateNpc aplica a pose de hit). */
  npc: {
    x: number;
    y: number;
    state: NPCBattleState["state"];
    updateNpc: (partial: Partial<NPCBattleState>) => void;
  };
  /** Dados do NPC principal para registrar a desintegração no toque. */
  mainNpcType: string;
  mainNpcPhase: number;
  /** O NPC principal é boss? (decide se a fase 2 sobrevive e o vidro quebra). */
  mainNpcIsBoss: boolean;
  isAlfa: boolean;
  /** Summons inimigos — todos os cruzados pela varredura morrem. */
  summons: SummonedNpc[];
  setSummons: Dispatch<SetStateAction<SummonedNpc[]>>;
  /** A varredura é habilidade ativa: paga só o vampirismo universal. */
  vampirism: VampirismStats;
  playerMaxHp: number;
  setPlayerHP: Dispatch<SetStateAction<number>>;
  /** Projéteis inimigos — a varredura desintegra os que a frente alcança. */
  projectiles: Projectile[];
  setProjectiles: Dispatch<SetStateAction<Projectile[]>>;
  setNpcHP: Dispatch<SetStateAction<number>>;
  /** Vida máxima do NPC principal — o dano exibido é 100% dela. */
  npcMaxHp: number;
  giveSummonRewards: (npcClass: NPCClass) => void;
  spawnDamageNumber: (
    value: number,
    x: number,
    y: number,
    type: DamageType,
  ) => void;
  /** Registra dano causado (combo/energia amaldiçoada/passivas). */
  registerHitRef: RefObject<(damage: number) => void>;
  freezeActionsUntilRef: RefObject<number>;
  /** Efeitos de time da batalha (regra `gameRules/battle/time`). */
  timeRef: RefObject<TimeEffect[]>;
  isPausedRef: RefObject<boolean>;
  /**
   * Menu da batalha aberto (pausa dirigida pelo jogador): congela a linha do
   * tempo do domínio — timers, frente da varredura, lock de ação e mundo.
   */
  isMenuOpen: boolean;
  battleEndedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  /** specialIntro: abre o background da habilidade (habilities/domainExpansion/...). */
  startSpecialIntro: (
    character: string,
    onActivate: () => void,
    ability?: string,
  ) => void;
  /** Disparado APENAS quando a varredura chega na outra ponta do mapa. */
  onNpcKilled: () => void;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  /** Carga atual da barra da Expansão (o uso consome tudo: vira 0). */
  charges: number;
  /** Carga máxima da barra — a habilidade só existe cheia. */
  chargesMax: number;
  setDelicia: Dispatch<SetStateAction<number>>;
};

type DomainExpansionApi = {
  /** Instância do mugetsuEffect varrendo o mapa (null quando inativa). */
  mugetsuSweep: MugetsuSweep | null;
  /** True do início da habilidade até o fim da varredura (troca o background). */
  domainExpansionActive: boolean;
  /** Fase de estilhaço do vidro: um boss de duas fases sobreviveu (fase 2). */
  shattering: boolean;
  /** Fase do blink do teleporte do jogador. */
  mugetsuBlink: MugetsuBlink;
  /** Alvos (NPC principal + summons) sendo desintegrados pela varredura. */
  disintegrating: MugetsuDisintegrationTarget[];
  press: () => void;
  usable: boolean;
};

/**
 * Expansão de Domínio do marcelo: o jogador troca para preMugetsu.svg, dá um
 * blink visual e se teletransporta para a ponta mais próxima do mapa; no pico
 * (mugetsu.svg) uma nova instância (mugetsuEffect.svg) cobre toda a altura do
 * mapa e varre de uma ponta à outra, matando instantaneamente (100% da vida
 * máxima) tudo que toca. A batalha só encerra quando a varredura chega na
 * outra ponta (via onNpcKilled) — por isso o isEnding é setado no spawn do
 * efeito, bloqueando o lifecycle enquanto ela percorre o mapa. Custo: as 40
 * cargas da barra da Expansão (sem cooldown próprio).
 */
export function useDomainExpansion({
  player,
  setPlayer,
  npc,
  mainNpcType,
  mainNpcPhase,
  mainNpcIsBoss,
  isAlfa,
  summons,
  setSummons,
  vampirism,
  playerMaxHp,
  setPlayerHP,
  projectiles,
  setProjectiles,
  setNpcHP,
  npcMaxHp,
  giveSummonRewards,
  spawnDamageNumber,
  registerHitRef,
  freezeActionsUntilRef,
  timeRef,
  isPausedRef,
  isMenuOpen,
  battleEndedRef,
  disabledRef,
  startSpecialIntro,
  onNpcKilled,
  playSound,
  charges,
  chargesMax,
  setDelicia,
}: Props): DomainExpansionApi {
  const [mugetsuSweep, setMugetsuSweep] = useState<MugetsuSweep | null>(null);
  const [domainExpansionActive, setDomainExpansionActive] = useState(false);
  const [shattering, setShattering] = useState(false);
  const [mugetsuBlink, setMugetsuBlink] = useState<MugetsuBlink>(null);
  const [disintegrating, setDisintegrating] = useState<
    MugetsuDisintegrationTarget[]
  >([]);

  const activeRef = useRef(false);
  const sweepStartRef = useRef(0);
  /** True quando a varredura chegou na outra ponta (resta o corte terminar). */
  const sweepEndedRef = useRef(false);
  /** Conta síncrona de alvos ainda desintegrando (independe do state commit). */
  const pendingDisintegrationsRef = useRef(0);
  const npcKilledRef = useRef(false);
  const killedSummonIdsRef = useRef(new Set<string>());
  const disintegratedProjectileIdsRef = useRef(new Set<string>());
  const completeFiredRef = useRef(false);
  /** True quando o fim da varredura já foi resolvido (dreno/teardown/quebra). */
  const endFiredRef = useRef(false);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /** Watchdog `DOMAIN_EXPANSION_TOTAL_MS` — handle do timer pausável. */
  const capHandleRef = useRef<PausableTimerHandle | null>(null);

  const playerRef = useLatestRef(player);
  const npcRef = useLatestRef(npc);
  const summonsRef = useLatestRef(summons);
  const projectilesRef = useLatestRef(projectiles);
  const sweepRef = useLatestRef(mugetsuSweep);
  const npcMaxHpRef = useLatestRef(npcMaxHp);
  const onNpcKilledRef = useLatestRef(onNpcKilled);
  const mainNpcTypeRef = useLatestRef(mainNpcType);
  const mainNpcPhaseRef = useLatestRef(mainNpcPhase);
  const mainNpcIsBossRef = useLatestRef(mainNpcIsBoss);
  const isAlfaRef = useLatestRef(isAlfa);
  const chargesRef = useLatestRef(charges);
  const chargesMaxRef = useLatestRef(chargesMax);
  const setDeliciaRef = useLatestRef(setDelicia);
  const isMenuOpenRef = useLatestRef(isMenuOpen);

  const { usable, usableRef, shouldCancelRef } = useSkillGuard({
    player,
    character: "marcelo",
    freezeActionsUntilRef,
    disabledRef,
    isPausedRef,
    battleEndedRef,
    extraCanUse: () =>
      chargesRef.current >= chargesMaxRef.current && !activeRef.current,
    extraCancel: () => !activeRef.current,
  });

  const timers = usePausableTimers(isMenuOpen);

  const clearTimers = useCallback(() => {
    timers.clear();
    capHandleRef.current = null;
  }, [timers]);

  const clearTimer = useCallback(() => {
    if (tickTimerRef.current != null) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
  }, []);

  // Pausa do jogador congela o domínio: ao fechar o menu, devolve o tempo que
  // ficou parado à frente da varredura, ao lock de ação e ao congelamento do
  // mundo — sem isso a Expansão "queimaria" o próprio tempo dentro do menu e
  // retomaria perto do fim (ou já morta).
  useMenuPauseShift(isMenuOpen, ({ pausedMs, pauseStart }) => {
    if (!activeRef.current) return;
    if (sweepStartRef.current !== 0) sweepStartRef.current += pausedMs;
    if (freezeActionsUntilRef.current > pauseStart) {
      freezeActionsUntilRef.current += pausedMs;
    }
    timeRef.current = timeRef.current.map((effect) =>
      effect.until > pauseStart
        ? { ...effect, until: effect.until + pausedMs }
        : effect,
    );
  });

  /**
   * Registra um alvo sendo desintegrado pela varredura. O corte na cena
   * persiste por `DOMAIN_EXPANSION_DISINTEGRATION_MS`; ao remover o último
   * alvo, o tick encerra a habilidade (só aí a vitória é disparada).
   */
  const registerDisintegration = useCallback(
    (target: MugetsuDisintegrationTarget) => {
      pendingDisintegrationsRef.current += 1;
      setDisintegrating((prev) =>
        prev.some((t) => t.id === target.id) ? prev : [...prev, target],
      );
      timers.schedule(() => {
        pendingDisintegrationsRef.current -= 1;
        setDisintegrating((prev) => prev.filter((t) => t.id !== target.id));
      }, DOMAIN_EXPANSION_DISINTEGRATION_MS);
    },
    [timers],
  );

  /** Encerra a habilidade (fim da varredura + corte ou cancelamento) e restaura o idle. */
  const finish = useCallback(() => {
    activeRef.current = false;
    clearTimers();
    clearTimer();
    sweepStartRef.current = 0;
    sweepEndedRef.current = false;
    pendingDisintegrationsRef.current = 0;
    timeRef.current = clearTime(timeRef.current, DOMAIN_EXPANSION_TIME_ID);
    setMugetsuSweep(null);
    setMugetsuBlink(null);
    setDomainExpansionActive(false);
    setShattering(false);
    setDisintegrating([]);
    setPlayer((p) =>
      p.mode !== "battle" || !ALL_PREDICATES.isDomainExpansion(p.state)
        ? p
        : { ...p, state: "idle" },
    );
    if (npcKilledRef.current && !completeFiredRef.current) {
      completeFiredRef.current = true;
      onNpcKilledRef.current();
    }
  }, [clearTimers, clearTimer, onNpcKilledRef, setPlayer, timeRef]);

  const finishRef = useLatestRef(finish);

  const cleanup = useCallback(() => {
    finish();
  }, [finish]);

  const cleanupRef = useLatestRef(cleanup);

  /**
   * Sobrou inimigo depois da varredura? A varredura cobre o mapa inteiro,
   * então o único sobrevivente possível é a fase 2 de um boss (o mugetsu
   * "mata" a fase 1 e o lifecycle segue para a fase seguinte).
   */
  const hasSurvivor = useCallback(() => {
    return (
      npcKilledRef.current &&
      mainNpcIsBossRef.current &&
      mainNpcPhaseRef.current === 1
    );
  }, [mainNpcIsBossRef, mainNpcPhaseRef]);

  /**
   * Fim normal da varredura: se sobrou um boss de fase 2, o `expansion.svg`
   * estilhaça e desce (`DOMAIN_SHATTER_MS`) antes de sair de cena; sem
   * sobrevivente, encerra direto (a vitória vem pelo `finish`).
   *
   * Chamado pelo tick (16ms), que continua rodando até o `finish` — daí o
   * `endFiredRef` (uma vez só) e o watchdog (`capHandleRef`, que cortaria o
   * vidro no meio) sair de cena quando a quebra vai acontecer.
   */
  const endDomain = useCallback(() => {
    if (endFiredRef.current) return;
    endFiredRef.current = true;

    if (!hasSurvivor()) {
      finishRef.current();
      return;
    }

    if (capHandleRef.current != null) {
      timers.cancel(capHandleRef.current);
      capHandleRef.current = null;
    }
    // A quebra do vidro é SÓ visual: o personagem já recupera o controle no
    // instante em que ela começa (`DOMAIN_SHATTER_MS` é só o tempo do
    // expansion.svg caindo de cena). Antes ele ficava travado os 1,5s da queda,
    // abrindo uma janela para ser atacado sem reagir.
    freezeActionsUntilRef.current = Date.now();
    setPlayer((p) =>
      p.mode !== "battle" || !ALL_PREDICATES.isDomainExpansion(p.state)
        ? p
        : { ...p, state: "idle" },
    );
    setShattering(true);
    timers.schedule(() => finishRef.current(), DOMAIN_SHATTER_MS);
  }, [finishRef, freezeActionsUntilRef, hasSurvivor, setPlayer, timers]);

  const endDomainRef = useLatestRef(endDomain);

  /** Cruzou a frente da varredura em `frontX` (mata de 0 em `fromX` até lá). */
  const hasCrossed = useCallback(
    (targetX: number, sweep: MugetsuSweep, frontX: number) => {
      if (sweep.direction === "right") {
        return targetX >= sweep.fromX && targetX <= frontX;
      }
      return targetX <= sweep.fromX && targetX >= frontX;
    },
    [],
  );

  /** Mata instantaneamente (100% da vida máxima) tudo que a varredura cruzou. */
  const applyKillAt = useCallback(
    (frontX: number) => {
      const sweep = sweepRef.current;
      if (!sweep) return;

      // NPC principal: HP → 0 no toque, mas a vitória só vem no fim da
      // varredura + desintegração. O sprite-base some (hidden) e o corte na
      // cena assume o visual a partir de agora.
      const main = npcRef.current;
      if (!npcKilledRef.current && hasCrossed(main.x, sweep, frontX)) {
        npcKilledRef.current = true;
        const damage = npcMaxHpRef.current;
        setNpcHP(0);
        spawnDamageNumber(damage, main.x, main.y, "special");
        registerHitRef.current?.(damage);
        // O execute não tem conta de dano para a armadura reduzir, mas a
        // varredura já declara o HP máximo como dano — é esse número que
        // alimenta o combo. A cura lê o mesmo valor para não divergir do que
        // o resto da batalha contabiliza como dano causado.
        applyVampirism({
          damage,
          source: "other",
          vampirism,
          playerMaxHp,
          setPlayerHP,
        });
        registerDisintegration({
          id: "main",
          npcType: mainNpcTypeRef.current,
          state: main.state,
          npcPhase: mainNpcPhaseRef.current,
          isAlfa: isAlfaRef.current,
          x: main.x,
          y: main.y,
          direction: sweep.direction,
          startedAt: Date.now(),
        });
        main.updateNpc({ state: "hit", hidden: true });
      }

      // Summons inimigos: removidos (com recompensa rare) no toque — o visual
      // da morte passa a ser o corte em duas metades.
      const killedIds = killedSummonIdsRef.current;
      let changed = false;
      let killed = false;
      const nextSummons = summonsRef.current.map((s) => {
        if (s.isDying || killedIds.has(s.id)) return s;
        if (!hasCrossed(s.x, sweep, frontX)) return s;
        killedIds.add(s.id);
        changed = true;
        killed = true;
        spawnDamageNumber(s.maxHp, s.x, s.y, "summon");
        registerHitRef.current?.(s.maxHp);
        applyVampirism({
          damage: s.maxHp,
          source: "other",
          vampirism,
          playerMaxHp,
          setPlayerHP,
        });
        registerDisintegration({
          id: s.id,
          npcType: s.npcType,
          state: s.state,
          npcPhase: 1,
          isAlfa: false,
          x: s.x,
          y: s.y,
          direction: sweep.direction,
          startedAt: Date.now(),
        });
        return null;
      });
      if (changed) {
        setSummons(nextSummons.filter((s): s is SummonedNpc => s != null));
      }
      if (killed) {
        giveSummonRewards("rare");
      }

      // Projéteis inimigos: a varredura desintegra o que a frente alcança (mesmo
      // critério X-only do NPC). O número de dano mostra o HP integral do
      // projétil, como no NPC/summon; `registerHit` fica de fora para o combo não
      // contar a destruction de um prato como dano do jogador.
      const disintegrated = disintegratedProjectileIdsRef.current;
      const crossedProjectiles = projectilesRef.current.filter(
        (p) => !disintegrated.has(p.id) && hasCrossed(p.x, sweep, frontX),
      );
      if (crossedProjectiles.length > 0) {
        const ids = new Set(crossedProjectiles.map((p) => p.id));
        for (const id of ids) disintegrated.add(id);
        setProjectiles((prev) => prev.filter((p) => !ids.has(p.id)));
        for (const p of crossedProjectiles) {
          const point = getProjectileCenter(p);
          spawnDamageNumber(p.hp, point.x, point.y, "special");
        }
      }
    },
    [
      giveSummonRewards,
      hasCrossed,
      isAlfaRef,
      mainNpcPhaseRef,
      mainNpcTypeRef,
      npcMaxHpRef,
      npcRef,
      playerMaxHp,
      projectilesRef,
      registerDisintegration,
      registerHitRef,
      setNpcHP,
      setPlayerHP,
      setProjectiles,
      setSummons,
      spawnDamageNumber,
      summonsRef,
      sweepRef,
      vampirism,
    ],
  );

  const applyKillAtRef = useLatestRef(applyKillAt);

  const tickRef = useLatestRef(
    useCallback(() => {
      // Pausa (menu aberto): a frente congela no lugar; o tempo parado é
      // devolvido por `useMenuPauseShift` quando o jogador despausa.
      if (isMenuOpenRef.current) return;

      // varredura já chegou na outra ponta: falta só o corte dos alvos terminar.
      if (sweepEndedRef.current) {
        if (pendingDisintegrationsRef.current === 0) {
          endDomainRef.current();
        }
        return;
      }

      const sweep = sweepRef.current;
      if (!sweep) return;

      const elapsed = Date.now() - sweepStartRef.current;
      const direction = sweep.direction === "right" ? 1 : -1;
      const frontX = Math.max(
        Math.min(
          sweep.fromX + direction * DOMAIN_EXPANSION_SWEEP_SPEED * elapsed,
          Math.max(sweep.fromX, sweep.toX),
        ),
        Math.min(sweep.fromX, sweep.toX),
      );

      applyKillAtRef.current(frontX);

      const reachedEnd =
        (sweep.direction === "right" && frontX >= sweep.toX) ||
        (sweep.direction === "left" && frontX <= sweep.toX);

      if (reachedEnd) {
        sweepEndedRef.current = true;
        // Some o efeito visual da varredura; o mundo segue coberto pelo
        // overlay da expansão até a última desintegração acabar.
        setMugetsuSweep(null);
        if (pendingDisintegrationsRef.current === 0) {
          endDomainRef.current();
        }
        return;
      }

      setMugetsuSweep((prev) => (prev ? { ...prev, x: frontX } : prev));
    }, [applyKillAtRef, endDomainRef, isMenuOpenRef, sweepRef]),
  );

  const press = useCallback(() => {
    if (activeRef.current) return;
    if (!usableRef.current) return;

    activeRef.current = true;
    // O custo é a barra inteira: as 40 cargas somem no uso (sem cooldown).
    setDeliciaRef.current(0);
    // Regra de time: a Expansão de Domínio para o mundo inteiro. O player fica
    // de fora do `TimeKind` — o lock de ação dele é o `freezeActionsUntilRef`.
    timeRef.current = applyTime(
      timeRef.current,
      freezeWorldSpec(DOMAIN_EXPANSION_TIME_ID, DOMAIN_EXPANSION_TOTAL_MS),
    );
    freezeActionsUntilRef.current = Math.max(
      freezeActionsUntilRef.current,
      Date.now() + DOMAIN_EXPANSION_TOTAL_MS,
    );
    clearTimers();
    setMugetsuSweep(null);
    setMugetsuBlink(null);
    setDomainExpansionActive(true);
    setShattering(false);
    setDisintegrating([]);
    npcKilledRef.current = false;
    killedSummonIdsRef.current.clear();
    disintegratedProjectileIdsRef.current.clear();
    completeFiredRef.current = false;
    endFiredRef.current = false;
    sweepEndedRef.current = false;
    pendingDisintegrationsRef.current = 0;

    // Teleporte para a ponta mais próxima: a varredura percorre o mapa inteiro.
    const p = playerRef.current;
    const midX = (BATTLE_LIMITS.minX + BATTLE_LIMITS.maxX) / 2;
    const fromX = p.x < midX ? BATTLE_LIMITS.minX : BATTLE_LIMITS.maxX;
    const toX =
      fromX === BATTLE_LIMITS.minX ? BATTLE_LIMITS.maxX : BATTLE_LIMITS.minX;
    const sweepDirection: "left" | "right" =
      fromX === BATTLE_LIMITS.minX ? "right" : "left";

    startSpecialIntro("marcelo", () => {}, "domainExpansion");

    const mugetsuAt = DOMAIN_EXPANSION_PRE_MS;
    const sweepAt = mugetsuAt + DOMAIN_EXPANSION_MUGETSU_MS;

    // A linha do tempo roda em timers pausáveis: com o menu aberto ela congela
    // (cada um com o tempo restante exato) e continua de onde parou no unpause.
    timers.schedule(() => {
      if (shouldCancelRef.current()) {
        cleanupRef.current();
        return;
      }
      setPlayer((pp) =>
        pp.mode !== "battle" ? pp : { ...pp, state: "preMugetsu" },
      );
      setMugetsuBlink("out");
      playSound("preAtomic");
    }, 0);

    // Teleporte para a ponta mais próxima no meio do blink + blink de chegada.
    timers.schedule(() => {
      if (shouldCancelRef.current()) {
        cleanupRef.current();
        return;
      }
      setPlayer((pp) =>
        pp.mode !== "battle"
          ? pp
          : {
              ...pp,
              x: fromX,
              battleDirection: sweepDirection,
            },
      );
      setMugetsuBlink("in");
    }, DOMAIN_EXPANSION_BLINK_OUT_MS);

    timers.schedule(() => {
      if (shouldCancelRef.current()) {
        cleanupRef.current();
        return;
      }
      setMugetsuBlink(null);
    }, DOMAIN_EXPANSION_BLINK_OUT_MS + DOMAIN_EXPANSION_BLINK_IN_MS);

    // Pico: sprite mugetsu.svg + som dedicado.
    timers.schedule(() => {
      if (shouldCancelRef.current()) {
        cleanupRef.current();
        return;
      }
      setPlayer((pp) =>
        pp.mode !== "battle" ? pp : { ...pp, state: "mugetsu" },
      );
      playSound("mugetsu");
    }, mugetsuAt);

    // Criação do mugetsuEffect: a partir daqui a câmera segue a varredura,
    // o jogador volta ao preMugetsu.svg e o isEnding bloqueia o lifecycle.
    timers.schedule(() => {
      if (shouldCancelRef.current()) {
        cleanupRef.current();
        return;
      }
      battleEndedRef.current = true;
      setPlayer((pp) =>
        pp.mode !== "battle" ? pp : { ...pp, state: "preMugetsu" },
      );
      setMugetsuSweep({
        x: fromX,
        fromX,
        toX,
        direction: sweepDirection,
        y: p.y,
      });
      sweepStartRef.current = Date.now();
      playSound("chargeAttack");
      clearTimer();
      tickTimerRef.current = setInterval(tickRef.current, 16);
    }, sweepAt);

    // O watchdog também fica com handle próprio: a quebra do vidro precisa
    // cancelá-lo (ele encerraria a habilidade com o vidro ainda em cena).
    capHandleRef.current = timers.schedule(
      () => cleanupRef.current(),
      DOMAIN_EXPANSION_TOTAL_MS,
    );
  }, [
    battleEndedRef,
    clearTimer,
    cleanupRef,
    clearTimers,
    freezeActionsUntilRef,
    playSound,
    playerRef,
    setPlayer,
    setDeliciaRef,
    shouldCancelRef,
    startSpecialIntro,
    timeRef,
    tickRef,
    timers,
    usableRef,
  ]);

  useEffect(() => {
    return () => {
      clearTimers();
      clearTimer();
      activeRef.current = false;
    };
  }, [clearTimer, clearTimers]);

  return {
    mugetsuSweep,
    domainExpansionActive,
    shattering,
    mugetsuBlink,
    disintegrating,
    press,
    usable,
  };
}
