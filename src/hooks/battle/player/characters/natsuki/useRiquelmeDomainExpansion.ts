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
import { applyTime, clearTime, freezeWorldSpec } from "@/gameRules/battle/time";
import type { TimeEffect } from "@/gameRules/battle/time";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import { DOMAIN_SHATTER_MS } from "@/data/characters/domainExpansions";
import {
  RIQUELME_DOMAIN_DRAIN_INTERVAL_MS,
  RIQUELME_DOMAIN_DRAIN_RATIO,
  RIQUELME_DOMAIN_MANA_RATIO,
  RIQUELME_DOMAIN_MS,
  RIQUELME_DOMAIN_TIME_ID,
} from "@/data/characters/riquelme/riquelme";
import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { SoundId } from "@/utils/audio/soundId";
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
  /** Vida MÁXIMA do NPC principal: o tick é `RIQUELME_DOMAIN_DRAIN_RATIO` dela. */
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
   * Energia amaldiçoada do riquelme: o uso do domínio consome metade do que ele
   * tem no momento (`RIQUELME_DOMAIN_MANA_RATIO`), além das 40 cargas.
   */
  battleManaRef: RefObject<BattleManaApi | null>;
  /** Efeitos de time da batalha (regra `gameRules/battle/time`). */
  timeRef: RefObject<TimeEffect[]>;
  isPausedRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  /** specialIntro: abre o `habilities/domainExpansion/background.svg`. */
  startSpecialIntro: (
    character: string,
    onActivate: () => void,
    ability?: string,
  ) => boolean;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  /** Carga atual da barra da Expansão (o uso consome tudo: vira 0). */
  charges: number;
  /** Carga máxima da barra — a habilidade só existe cheia. */
  chargesMax: number;
  setDelicia: Dispatch<SetStateAction<number>>;
};

type RiquelmeDomainApi = {
  /** O `expansion.svg` está em cena (intro + dreno + quebra). */
  active: boolean;
  /** Fase de estilhaço: algum inimigo sobreviveu e o vidro quebra e desce. */
  shattering: boolean;
  press: () => void;
  usable: boolean;
};

/**
 * O dreno cai a cada 100ms, mas o NÚMERO de dano sai a cada 5 pulsos (500ms)
 * com o total acumulado — 50 números sobrepostos no mesmo pixel por inimigo
 * seriam ilegíveis. A vida continua caindo a cada pulso.
 */
const DAMAGE_NUMBER_EVERY_TICKS = 5;

/**
 * Expansão de Domínio do riquelme (Muryōkūsho): o personagem trava na pose
 * `rioiki.svg`, o mundo inteiro congela (o player fica de fora do `TimeKind`;
 * o lock dele é o `freezeActionsUntilRef`) e TODOS os inimigos — o NPC
 * principal e os summons — drenam `RIQUELME_DOMAIN_DRAIN_RATIO` (1%) da própria
 * vida MÁXIMA a cada 100ms, por 5s. O dreno é direto no HP (não passa pelo
 * funil de armadura), então um boss que se regenera continua perdendo vida até
 * o domínio acabar (a regeneração dele entra no meio).
 *
 * No fim, se algum inimigo sobreviveu, o `expansion.svg` estilhaça como vidro
 * e desce para fora do campo de visão — a mesma quebra que a Expansão do
 * marcelo usa quando sobra alguém. Se ninguém sobreviveu, a batalha só segue
 * (vitória pelo lifecycle normal: o dreno pode zerar a vida e matar de verdade).
 * Custo: as 40 cargas da barra + metade da energia amaldiçoada que ele tem no
 * momento (`RIQUELME_DOMAIN_MANA_RATIO`), sem cooldown próprio. Durante o
 * domínio o personagem fica na pose `rioiki`, e é ela que trava o blink
 * (passiva O Abençoado): teleportar no meio do domínio seria fugir dele.
 */
export function useRiquelmeDomainExpansion({
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
  battleEndedRef,
  disabledRef,
  startSpecialIntro,
  playSound,
  charges,
  chargesMax,
  setDelicia,
}: Props): RiquelmeDomainApi {
  const [active, setActive] = useState(false);
  const [shattering, setShattering] = useState(false);

  const activeRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const drainTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickCountRef = useRef(0);

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

  const { usable, usableRef, shouldCancelRef } = useSkillGuard({
    player,
    character: "riquelme",
    freezeActionsUntilRef,
    disabledRef,
    isPausedRef,
    battleEndedRef,
    extraCanUse: () =>
      chargesRef.current >= chargesMaxRef.current && !activeRef.current,
    extraCancel: () => !activeRef.current,
  });

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) clearTimeout(timer);
    timersRef.current = [];
  }, []);

  const clearDrain = useCallback(() => {
    if (drainTimerRef.current != null) {
      clearInterval(drainTimerRef.current);
      drainTimerRef.current = null;
    }
  }, []);

  /** Vida máxima → 1 tick de dreno (1% dela, no mínimo 1 de dano). */
  const tickDamage = useCallback((maxHp: number) => {
    return Math.max(1, Math.floor(maxHp * RIQUELME_DOMAIN_DRAIN_RATIO));
  }, []);

  /**
   * Um pulso do dreno: NPC principal + summons inimigos. Roda em intervalo
   * próprio (100ms) e não mexe no `isEnding` — é o lifecycle normal que trata
   * a morte (o boss de duas fases segue para a fase seguinte e continua
   * drenando até o fim dos 5s).
   */
  const drainTick = useCallback(() => {
    // Pausa (menu aberto) não drena: o intervalo é em tempo real.
    if (isPausedRef.current) return;

    tickCountRef.current += 1;
    const flush = tickCountRef.current % DAMAGE_NUMBER_EVERY_TICKS === 0;

    const main = npcRef.current;
    if (npcHPRef.current > 0) {
      const damage = tickDamage(npcMaxHpRef.current);
      setNpcHPRef.current((hp) => Math.max(0, hp - damage));
      if (flush) {
        spawnDamageRef.current(
          damage * DAMAGE_NUMBER_EVERY_TICKS,
          main.x,
          main.y,
          "special",
        );
      }
    }

    const alive = summonsRef.current.filter((s) => !s.isDying && s.hp > 0);
    if (alive.length === 0) return;

    const damageById = new Map(
      alive.map((s) => [s.id, tickDamage(s.maxHp)] as const),
    );
    if (flush) {
      for (const s of alive) {
        spawnDamageRef.current(
          (damageById.get(s.id) ?? 1) * DAMAGE_NUMBER_EVERY_TICKS,
          s.x,
          s.y,
          "summon",
        );
      }
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
    timeRef.current = clearTime(timeRef.current, RIQUELME_DOMAIN_TIME_ID);
    setActive(false);
    setShattering(false);
    setPlayer((p) =>
      p.mode !== "battle" || !ALL_PREDICATES.isRiquelmeDomain(p.state)
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
    timeRef.current = clearTime(timeRef.current, RIQUELME_DOMAIN_TIME_ID);

    if (!hasSurvivor()) {
      finishRef.current();
      return;
    }

    // O vidro leva `DOMAIN_SHATTER_MS` para sair de cena: o player segue
    // travado até lá (o lock do press só cobria o dreno).
    freezeActionsUntilRef.current = Math.max(
      freezeActionsUntilRef.current,
      Date.now() + DOMAIN_SHATTER_MS,
    );
    setShattering(true);
    playSoundRef.current("domainBreak");
    timersRef.current.push(
      setTimeout(() => finishRef.current(), DOMAIN_SHATTER_MS),
    );
  }, [
    clearDrain,
    finishRef,
    freezeActionsUntilRef,
    hasSurvivor,
    playSoundRef,
    timeRef,
  ]);

  const endDomainRef = useLatestRef(endDomain);

  /** Início do domínio de fato: congela o mundo, trava o player e liga o dreno. */
  const startDomain = useCallback(() => {
    setShattering(false);
    setActive(true);
    // Regra de time: o domínio para o mundo inteiro. O player fica de fora do
    // `TimeKind`; o lock dele é o `freezeActionsUntilRef`.
    timeRef.current = applyTime(
      timeRef.current,
      freezeWorldSpec(RIQUELME_DOMAIN_TIME_ID, RIQUELME_DOMAIN_MS),
    );
    freezeActionsUntilRef.current = Math.max(
      freezeActionsUntilRef.current,
      Date.now() + RIQUELME_DOMAIN_MS,
    );
    playSoundRef.current("domainInitiate");
    playSoundRef.current("riquelmeOpenedDomain");

    clearDrain();
    drainTickRef.current();
    drainTimerRef.current = setInterval(
      () => drainTickRef.current(),
      RIQUELME_DOMAIN_DRAIN_INTERVAL_MS,
    );
    timersRef.current.push(
      setTimeout(() => endDomainRef.current(), RIQUELME_DOMAIN_MS),
    );
  }, [
    clearDrain,
    drainTickRef,
    endDomainRef,
    freezeActionsUntilRef,
    playSoundRef,
    timeRef,
  ]);

  const startDomainRef = useLatestRef(startDomain);

  const press = useCallback(() => {
    if (activeRef.current) return;
    if (!usableRef.current) return;

    // O custo é a barra inteira: as 40 cargas somem no uso (sem cooldown) —
    // mais `RIQUELME_DOMAIN_MANA_RATIO` da energia amaldiçoada que ele tem no
    // momento. Como é sempre metade do que existe, não há mínimo exigido: o
    // domínio sempre paga (e esvazia o tanque pela metade).
    setDeliciaRef.current(0);
    const mana = battleManaRef.current;
    if (mana) {
      mana.consumeMana(
        Math.floor(mana.playerMana * RIQUELME_DOMAIN_MANA_RATIO),
      );
    }
    // Trava já no press: cobre a intro (background.svg) + o dreno. A quebra do
    // vidro, quando acontece, adia o lock no `endDomain` (só aí ele é maior).
    freezeActionsUntilRef.current = Math.max(
      freezeActionsUntilRef.current,
      Date.now() + RIQUELME_DOMAIN_MS,
    );
    // `activeRef` liga aqui, não só no `startDomain`: a intro pode segurar 1s
    // antes de chamar o callback, e é ele que fecha o botão (`extraCanUse`) e
    // desarma o `shouldCancel` (`extraCancel: () => !activeRef.current`).
    activeRef.current = true;
    tickCountRef.current = 0;
    clearTimers();
    setShattering(false);

    // Pose `rioiki.svg` imediata (mesmo com o intro ligado, ela fica embaixo).
    timersRef.current.push(
      setTimeout(() => {
        if (shouldCancelRef.current()) return;
        setPlayer((p) => (p.mode !== "battle" ? p : { ...p, state: "rioiki" }));
      }, 0),
    );

    // SFX da abertura: sai junto com a intro `background.svg` entrando na
    // tela (é o grito/pose do `rioiki.svg`). O som do domínio em si —
    // `riquelmeOpenedDomain` — é o `startDomain`, que roda só no fim da intro.
    playSoundRef.current("riquelmeRioiki");

    // A intro `background.svg` abre o domínio; sem o intro (Config), o
    // `startDomain` roda na hora. Se já havia um intro em curso (o hook
    // devolve false sem chamar o callback), não deixa o domínio pendurado.
    const started = startIntroRef.current(
      "riquelme",
      () => startDomainRef.current(),
      "domainExpansion",
    );
    if (!started) startDomainRef.current();
  }, [
    battleManaRef,
    clearTimers,
    freezeActionsUntilRef,
    playSoundRef,
    setDeliciaRef,
    setPlayer,
    shouldCancelRef,
    startDomainRef,
    startIntroRef,
    usableRef,
  ]);

  useEffect(() => {
    const time = timeRef;
    return () => {
      clearTimers();
      clearDrain();
      activeRef.current = false;
      // Desmontou no meio do domínio: não deixa o mundo congelado para trás.
      time.current = clearTime(time.current, RIQUELME_DOMAIN_TIME_ID);
    };
  }, [clearDrain, clearTimers, timeRef]);

  return { active, shattering, press, usable };
}
