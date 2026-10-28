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
import { useSkillGuard } from "@/hooks/battle/player/characters/useSkillGuard";
import { usePausableTimers } from "@/hooks/battle/utilities/usePausableTimers";
import { useMenuPauseShift } from "@/hooks/battle/utilities/useMenuPauseShift";
import { applyTime, clearTime, freezeWorldSpec } from "@/gameRules/battle/time";
import type { TimeEffect } from "@/gameRules/battle/time";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import { DOMAIN_SHATTER_MS } from "@/data/characters/domainExpansions";
import {
  NATSUKI_DOMAIN_DRAIN_INTERVAL_MS,
  NATSUKI_DOMAIN_DRAIN_RATIO,
  NATSUKI_DOMAIN_MANA_RATIO,
  NATSUKI_DOMAIN_MS,
  NATSUKI_DOMAIN_TIME_ID,
} from "@/data/characters/natsuki/natsuki";
import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { SoundId } from "@/utils/audio/soundId";
import type { MarshadowBattleForm } from "@/utils/paths/characters/marshadow/types";
import type { SummonedNpc } from "@/utils/types/npc/npc";

type Props = {
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  /** NPC principal (x/y via latestRef, para o número de dano do dreno). */
  npc: {
    x: number;
    y: number;
  };
  /** Vida atual do NPC principal — se já está zerada, o tick não drena. */
  npcHP: number;
  /** Vida MÁXIMA do NPC principal: o tick é `NATSUKI_DOMAIN_DRAIN_RATIO` dela. */
  npcMaxHp: number;
  setNpcHP: Dispatch<SetStateAction<number>>;
  /** Summons inimigos — todos drenam no mesmo ritmo do NPC principal. */
  summons: SummonedNpc[];
  setSummons: Dispatch<SetStateAction<SummonedNpc[]>>;
  spawnDamageNumber: (
    value: number,
    x: number,
    y: number,
    type: DamageType,
  ) => void;
  freezeActionsUntilRef: RefObject<number>;
  /**
   * Energia amaldiçoada do natsuki: o uso do domínio consome metade do que ele
   * tem no momento (`NATSUKI_DOMAIN_MANA_RATIO`), além das 40 cargas.
   */
  battleManaRef: RefObject<BattleManaApi | null>;
  /** Efeitos de time da batalha (regra `gameRules/battle/time`). */
  timeRef: RefObject<TimeEffect[]>;
  isPausedRef: RefObject<boolean>;
  /**
   * Menu da batalha aberto (pausa dirigida pelo jogador): congela o domínio —
   * timers, lock de ação e congelamento do mundo.
   */
  isMenuOpen: boolean;
  battleEndedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  /** specialIntro: abre o `habilities/domainExpansion/background.svg`. */
  startSpecialIntro: (
    character: string,
    onActivate: () => void,
    ability?: string,
    form?: MarshadowBattleForm,
    onCancel?: () => void,
  ) => boolean;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  /** Carga atual da barra da Expansão (o uso consome tudo: vira 0). */
  charges: number;
  /** Carga máxima da barra — a habilidade só existe cheia. */
  chargesMax: number;
  setDelicia: Dispatch<SetStateAction<number>>;
};

type NatsukiDomainApi = {
  /** O `expansion.svg` está em cena (intro + dreno + quebra). */
  active: boolean;
  /** Fase de estilhaço: algum inimigo sobreviveu e o vidro quebra e desce. */
  shattering: boolean;
  press: () => void;
  usable: boolean;
};

/**
 * Expansão de Domínio do natsuki (Muryōkūsho): o personagem trava na pose
 * `rioiki.svg`, o mundo inteiro congela (o player fica de fora do `TimeKind`;
 * o lock dele é o `freezeActionsUntilRef`) e TODOS os inimigos — o NPC
 * principal e os summons — drenam `NATSUKI_DOMAIN_DRAIN_RATIO` (0,2%) da
 * própria vida MÁXIMA a cada `NATSUKI_DOMAIN_DRAIN_INTERVAL_MS` (50ms), por
 * 5s. O dreno é direto no HP (não passa pelo funil de armadura), então um boss
 * que se regenera continua perdendo vida até o domínio acabar (a regeneração
 * dele entra no meio).
 *
 * Cada pulso emite o próprio número de dano — o valor REAL do pulso, não um
 * total acumulado. O `floatUp` do DamageNumbers desencontra os números no
 * tempo (cada instância sobe a partir da própria origem), então o fluxo lê
 * como uma chuva de golpes em vez de um "5" fixo que não corresponde ao dano.
 *
 * No fim, se algum inimigo sobreviveu, o `expansion.svg` estilhaça como vidro
 * e desce para fora do campo de visão — a mesma quebra que a Expansão do
 * marshadow usa quando sobra alguém. Se ninguém sobreviveu, a batalha só segue
 * (vitória pelo lifecycle normal: o dreno pode zerar a vida e matar de verdade).
 * Custo: as 40 cargas da barra + metade da energia amaldiçoada que ele tem no
 * momento (`NATSUKI_DOMAIN_MANA_RATIO`), sem cooldown próprio. Durante o
 * domínio o personagem fica na pose `rioiki`, e é ela que trava o blink
 * (passiva O Abençoado): teleportar no meio do domínio seria fugir dele.
 */
export function useHakaiExpansion({
  player,
  setPlayer,
  npc,
  npcHP,
  npcMaxHp,
  setNpcHP,
  summons,
  setSummons,
  spawnDamageNumber,
  freezeActionsUntilRef,
  battleManaRef,
  timeRef,
  isPausedRef,
  isMenuOpen,
  battleEndedRef,
  disabledRef,
  startSpecialIntro,
  playSound,
  charges,
  chargesMax,
  setDelicia,
}: Props): NatsukiDomainApi {
  const [active, setActive] = useState(false);
  const [shattering, setShattering] = useState(false);

  const activeRef = useRef(false);
  const drainTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const timers = usePausableTimers(isMenuOpen);

  const npcRef = useLatestRef(npc);
  const npcHPRef = useLatestRef(npcHP);
  const npcMaxHpRef = useLatestRef(npcMaxHp);
  const summonsRef = useLatestRef(summons);
  const chargesRef = useLatestRef(charges);
  const chargesMaxRef = useLatestRef(chargesMax);
  const setDeliciaRef = useLatestRef(setDelicia);
  const setNpcHPRef = useLatestRef(setNpcHP);
  const setSummonsRef = useLatestRef(setSummons);
  const spawnDamageRef = useLatestRef(spawnDamageNumber);
  const startIntroRef = useLatestRef(startSpecialIntro);
  const playSoundRef = useLatestRef(playSound);

  // Pausa do jogador congela o domínio: ao fechar o menu, o tempo parado é
  // devolvido ao lock de ação e ao congelamento do mundo — senão os 5s do
  // dreno "queimariam" dentro do menu e o domínio retomaria já no fim.
  useMenuPauseShift(isMenuOpen, ({ pausedMs, pauseStart }) => {
    if (!activeRef.current) return;
    if (freezeActionsUntilRef.current > pauseStart) {
      freezeActionsUntilRef.current += pausedMs;
    }
    timeRef.current = timeRef.current.map((effect) =>
      effect.until > pauseStart
        ? { ...effect, until: effect.until + pausedMs }
        : effect,
    );
  });

  const { usable, usableRef, shouldCancelRef } = useSkillGuard({
    player,
    character: "ematron",
    freezeActionsUntilRef,
    disabledRef,
    isPausedRef,
    battleEndedRef,
    extraCanUse: () =>
      chargesRef.current >= chargesMaxRef.current && !activeRef.current,
    extraCancel: () => !activeRef.current,
  });

  const clearTimers = useCallback(() => {
    timers.clear();
  }, [timers]);

  const clearDrain = useCallback(() => {
    if (drainTimerRef.current != null) {
      clearInterval(drainTimerRef.current);
      drainTimerRef.current = null;
    }
  }, []);

  /** Vida máxima → 1 tick de dreno (`NATSUKI_DOMAIN_DRAIN_RATIO`, no mínimo 1). */
  const tickDamage = useCallback((maxHp: number) => {
    return Math.max(1, Math.floor(maxHp * NATSUKI_DOMAIN_DRAIN_RATIO));
  }, []);

  /**
   * Um pulso do dreno: NPC principal + summons inimigos. Roda em intervalo
   * próprio (50ms) e não mexe no `isEnding` — é o lifecycle normal que trata
   * a morte (o boss de duas fases segue para a fase seguinte e continua
   * drenando até o fim dos 5s).
   *
   * Cada inimigo emite o próprio número com o dano REAL do pulso: o valor é
   * `tickDamage` (mínimo 1), não um acumulado. Números de pulsos diferentes
   * convivem na tela — o `floatUp` os separa verticalmente ao longo do 1s de
   * vida, então vários "1" sobem juntos sem virar um "5" enganoso.
   */
  const drainTick = useCallback(() => {
    // Pausa (menu aberto) não drena: o intervalo é em tempo real.
    if (isPausedRef.current) return;

    const main = npcRef.current;
    if (npcHPRef.current > 0) {
      const damage = tickDamage(npcMaxHpRef.current);
      setNpcHPRef.current((hp) => Math.max(0, hp - damage));
      spawnDamageRef.current(damage, main.x, main.y, "special");
    }

    const alive = summonsRef.current.filter((s) => !s.isDying && s.hp > 0);
    if (alive.length === 0) return;

    const damageById = new Map(
      alive.map((s) => [s.id, tickDamage(s.maxHp)] as const),
    );
    for (const s of alive) {
      spawnDamageRef.current(damageById.get(s.id) ?? 1, s.x, s.y, "summon");
    }
    setSummonsRef.current((prev) =>
      prev.map((s) => {
        const damage = damageById.get(s.id);
        if (damage == null) return s;
        return { ...s, hp: Math.max(0, s.hp - damage) };
      }),
    );
  }, [
    isPausedRef,
    npcRef,
    npcHPRef,
    npcMaxHpRef,
    setNpcHPRef,
    setSummonsRef,
    spawnDamageRef,
    summonsRef,
    tickDamage,
  ]);

  const drainTickRef = useLatestRef(drainTick);

  /** Algum inimigo vivo depois dos 5s? Então o vidro quebra. */
  const hasSurvivor = useCallback(() => {
    if (npcHPRef.current > 0) return true;
    return summonsRef.current.some((s) => !s.isDying && s.hp > 0);
  }, [npcHPRef, summonsRef]);

  /** Teardown final: limpa o dreno/congelamento, sai de cena e devolve o idle. */
  const finish = useCallback(() => {
    activeRef.current = false;
    clearTimers();
    clearDrain();
    timeRef.current = clearTime(timeRef.current, NATSUKI_DOMAIN_TIME_ID);
    setActive(false);
    setShattering(false);
    setPlayer((p) =>
      p.mode !== "battle" || !ALL_PREDICATES.isNatsukiDomain(p.state)
        ? p
        : { ...p, state: "idle" },
    );
  }, [clearDrain, clearTimers, setPlayer, timeRef]);

  const finishRef = useLatestRef(finish);

  /**
   * Fim do dreno (5s): descongela o mundo na hora e, se sobrou inimigo,
   * deixa o `expansion.svg` estilhaçar e descer antes de sair de cena; sem
   * sobrevivente, encerra direto (a vitória já veio pelo lifecycle).
   */
  const endDomain = useCallback(() => {
    clearDrain();
    timeRef.current = clearTime(timeRef.current, NATSUKI_DOMAIN_TIME_ID);

    if (!hasSurvivor()) {
      finishRef.current();
      return;
    }

    // A quebra do vidro é SÓ visual: o personagem já recupera o controle no
    // instante em que ela começa (`DOMAIN_SHATTER_MS` é só o tempo do
    // expansion.svg caindo de cena). Antes ele ficava travado os 1,5s da queda,
    // abrindo uma janela para ser atacado sem reagir.
    freezeActionsUntilRef.current = Date.now();
    setPlayer((p) =>
      p.mode !== "battle" || !ALL_PREDICATES.isNatsukiDomain(p.state)
        ? p
        : { ...p, state: "idle" },
    );
    setShattering(true);
    playSoundRef.current("domainBreak");
    timers.schedule(() => finishRef.current(), DOMAIN_SHATTER_MS);
  }, [
    clearDrain,
    finishRef,
    freezeActionsUntilRef,
    hasSurvivor,
    playSoundRef,
    setPlayer,
    timeRef,
    timers,
  ]);

  const endDomainRef = useLatestRef(endDomain);

  /** Início do domínio de fato: congela o mundo, trava o player e liga o dreno. */
  const startDomain = useCallback(() => {
    // Se algo tomou o controle no meio da intro (O Abençoado), o domínio morre
    // aqui: não congela, não trava e não paga nada.
    if (shouldCancelRef.current()) {
      activeRef.current = false;
      return;
    }

    // O custo é a barra inteira: as 40 cargas somem no uso (sem cooldown) —
    // mais `NATSUKI_DOMAIN_MANA_RATIO` da energia amaldiçoada que ele tem no
    // momento. Como é sempre metade do que existe, não há mínimo exigido: o
    // domínio sempre paga (e esvazia o tanque pela metade).
    setDeliciaRef.current(0);
    const mana = battleManaRef.current;
    if (mana) {
      mana.consumeMana(Math.floor(mana.playerMana * NATSUKI_DOMAIN_MANA_RATIO));
    }

    setShattering(false);
    setActive(true);
    // Regra de time: o domínio para o mundo inteiro. O player fica de fora do
    // `TimeKind`; o lock dele é o `freezeActionsUntilRef`.
    timeRef.current = applyTime(
      timeRef.current,
      freezeWorldSpec(NATSUKI_DOMAIN_TIME_ID, NATSUKI_DOMAIN_MS),
    );
    freezeActionsUntilRef.current = Math.max(
      freezeActionsUntilRef.current,
      Date.now() + NATSUKI_DOMAIN_MS,
    );
    playSoundRef.current("domainInitiate");
    playSoundRef.current("natsukiOpenedDomain");

    timers.clear();
    drainTickRef.current();
    drainTimerRef.current = setInterval(
      () => drainTickRef.current(),
      NATSUKI_DOMAIN_DRAIN_INTERVAL_MS,
    );
    timers.schedule(() => endDomainRef.current(), NATSUKI_DOMAIN_MS);
  }, [
    battleManaRef,
    drainTickRef,
    endDomainRef,
    freezeActionsUntilRef,
    playSoundRef,
    setDeliciaRef,
    shouldCancelRef,
    timeRef,
    timers,
  ]);

  const startDomainRef = useLatestRef(startDomain);

  const press = useCallback(() => {
    if (activeRef.current) return;
    if (!usableRef.current) return;

    // Trava já no press: cobre a intro (background.svg) + o dreno. A quebra do
    // vidro, quando acontece, devolve o controle na hora (ver `endDomain`). O
    // CUSTO é cobrado no `startDomain`: a intro pode ser cancelada por uma
    // tomada de controle (O Abençoado) e o domínio não pode pagar por algo que
    // nunca entrou em cena.
    freezeActionsUntilRef.current = Math.max(
      freezeActionsUntilRef.current,
      Date.now() + NATSUKI_DOMAIN_MS,
    );
    // `activeRef` liga aqui, não só no `startDomain`: a intro pode segurar 1s
    // antes de chamar o callback, e é ele que fecha o botão (`extraCanUse`) e
    // desarma o `shouldCancel` (`extraCancel: () => !activeRef.current`).
    activeRef.current = true;
    clearTimers();
    setShattering(false);

    // Pose `rioiki.svg` imediata (mesmo com o intro ligado, ela fica embaixo).
    timers.schedule(() => {
      if (shouldCancelRef.current()) return;
      setPlayer((p) => (p.mode !== "battle" ? p : { ...p, state: "rioiki" }));
    }, 0);

    // SFX da abertura: sai junto com a intro `background.svg` entrando na
    // tela (é o grito/pose do `rioiki.svg`). O som do domínio em si —
    // `natsukiOpenedDomain` — é o `startDomain`, que roda só no fim da intro.
    playSoundRef.current("natsukiRioiki");

    // A intro `background.svg` abre o domínio; sem o intro (Config), o
    // `startDomain` roda na hora. Se já havia um intro em curso (o hook
    // devolve false sem chamar o callback), não deixa o domínio pendurado.
    const started = startIntroRef.current(
      "natsuki",
      () => startDomainRef.current(),
      "domainExpansion",
      undefined,
      () => {
        activeRef.current = false;
        clearTimers();
      },
    );
    if (!started) startDomainRef.current();
  }, [
    clearTimers,
    freezeActionsUntilRef,
    playSoundRef,
    setPlayer,
    shouldCancelRef,
    startDomainRef,
    startIntroRef,
    timers,
    usableRef,
  ]);

  useEffect(() => {
    const time = timeRef;
    return () => {
      clearTimers();
      clearDrain();
      activeRef.current = false;
      // Desmontou no meio do domínio: não deixa o mundo congelado para trás.
      time.current = clearTime(time.current, NATSUKI_DOMAIN_TIME_ID);
    };
  }, [clearDrain, clearTimers, timeRef]);

  return { active, shattering, press, usable };
}
