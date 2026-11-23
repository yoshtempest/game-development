import type { Props } from "./types";
import { useEffect, useRef } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";

import {
  HONORED_ONE_FLEE_DISTANCE,
  HONORED_ONE_FLEE_STEP,
} from "@/gameRules/battle/cursedEnergy";
import { BATTLE_LIMITS } from "@/gameRules/movement/constants";
import {
  computeSummonDamage,
  SUMMON_DAMAGE_KIND,
} from "@/hooks/battle/summon/computeSummonDamage";
import { applyHitstop, getTime, scaleCooldown } from "@/gameRules/battle/time";

import { clampX } from "@/gameRules/movement/clampX";
import { getPetBlindMissChance } from "@/gameRules/battle/petSkill/blind";
/** Velocidade acima da qual o hungryDog é considerado correndo (usa run.svg). */
const HUNGRY_DOG_RUN_SPEED = 1.5;

export function useSummonAI({
  summons,
  setSummons,
  isPaused,
  playerX,
  playerY,
  playerClass,
  playerCharacter,
  npcLevel,
  difficulty,
  damagePlayer,
  spawnDamageRef,
  timeRef,
  freezeUntilRef,
  rootedSummonsUntilRef,
  honoredFleeRef,
  petBlindRef,
  onSummonKilled,
}: Props) {
  const summonLastAttacksRef = useRef<Record<string, number>>({});

  // Timers de remoção dos summons mortos, por id (500ms da animação de dying).
  // Guardar em ref evita que o re-run imediato do effect (a marcação de
  // `isDying` troca `summons` e re-dispara o effect) limpe o timer no cleanup
  // — antes, o cleanup cancelava o timer e o re-run não re-agendava nada, então
  // o summon ficava em `isDying` para sempre. A limpeza fica só no unmount.
  const deathTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );

  const playerXRef = useLatestRef(playerX);
  const playerYRef = useLatestRef(playerY);
  const playerCharacterRef = useLatestRef(playerCharacter);

  const isPausedRef = useLatestRef(isPaused);

  const npcLevelRef = useLatestRef(npcLevel);
  const difficultyRef = useLatestRef(difficulty);
  const playerClassRef = useLatestRef(playerClass);
  const damagePlayerRef = useLatestRef(damagePlayer);
  const summonsRef = useLatestRef(summons);
  const setSummonsRef = useLatestRef(setSummons);
  const onSummonKilledRef = useLatestRef(onSummonKilled);

  useEffect(() => {
    // `[].map()` devolve array novo — sem o compare o React re-renderizaria a
    // batalha 50×/s mesmo sem nenhum summon em campo.
    const apply = (
      prev: SummonedNpc[],
      map: (s: SummonedNpc) => SummonedNpc,
    ) => {
      const next = prev.map(map);
      return next.every((s, i) => s === prev[i]) ? prev : next;
    };

    const interval = setInterval(() => {
      const px = playerXRef.current;

      // Passiva "O Abençoado": summons inimigos recuam do jogador (roda mesmo
      // com o AI pausado, pois a batalha está congelada durante a sequência).
      if (honoredFleeRef?.current) {
        setSummonsRef.current((prev) =>
          apply(prev, (s) => {
            if (s.isDying || s.hp <= 0) return s;
            const dist = Math.abs(s.x - px);
            if (dist >= HONORED_ONE_FLEE_DISTANCE) return s;
            const step = Math.min(
              HONORED_ONE_FLEE_DISTANCE - dist,
              HONORED_ONE_FLEE_STEP,
            );
            const awayDir = s.x >= px ? 1 : -1;
            return {
              ...s,
              x: clampX(s.x + awayDir * step),
              direction: awayDir > 0 ? "right" : "left",
              state: "walk",
            };
          }),
        );
        return;
      }

      if (isPausedRef.current) return;
      if (freezeUntilRef?.current && freezeUntilRef.current > Date.now())
        return;

      // O dano é aplicado FORA do updater: dentro do updater o React roda a
      // função durante o próprio render da batalha, e `damagePlayer` dispara
      // setState de outros componentes (contadores de título, HP do player) —
      // o "Cannot update a component while rendering a different component".
      // O tick coleta os golpes na passada pura e aplica depois do commit.
      const attackEvents: { damage: number; attackerX: number }[] = [];
      let missEvents = 0;

      const next = apply(summonsRef.current, (s) => {
        if (s.isDying || s.hp <= 0) {
          return s;
        }

        // Regra de time: a classe decide, o summon é isento só se o efeito
        // listar o id dele em `exempt`.
        const time = getTime(timeRef.current, "summon", s.id);
        if (time.speed === 0) return s;

        // A escala de time afeta o deslocamento, não o estado do sprite:
        // `speed` segue sendo a velocidade "de projeto" (o hungryDog só corre
        // quando a distância pede), `moveStep` é o que o time do mundo mede.
        const speed =
          s.x > BATTLE_LIMITS.maxX ? 6 : Math.abs(s.x - px) > 200 ? 3 : 1.5;
        const moveStep = speed * time.speed;

        const dx = px - s.x;

        const direction: "left" | "right" = dx > 0 ? "right" : "left";

        const rooted =
          (rootedSummonsUntilRef?.current?.[s.id] ?? 0) > Date.now();

        let newX = s.x;

        if (!rooted && Math.abs(dx) > 40) {
          newX += dx > 0 ? moveStep : -moveStep;
        }

        const running =
          !rooted && s.npcType === "hungryDog" && speed > HUNGRY_DOG_RUN_SPEED;

        if (Math.abs(dx) <= 40) {
          const now = Date.now();

          const lastAttack = summonLastAttacksRef.current[s.id] ?? 0;

          if (now - lastAttack >= scaleCooldown(time, 800)) {
            summonLastAttacksRef.current[s.id] = now;

            const damage = computeSummonDamage(
              s,
              npcLevelRef.current,
              difficultyRef.current,
              playerClassRef.current,
              playerCharacterRef.current,
            );

            const blindMiss =
              Math.random() <
              getPetBlindMissChance(petBlindRef?.current?.[s.id], now);

            if (blindMiss) {
              missEvents += 1;
            } else if (damage !== null) {
              attackEvents.push({ damage, attackerX: s.x });
            }
          }
        }

        return {
          ...s,
          x: newX,
          direction,
          state: Math.abs(dx) > 80 ? (running ? "run" : "walk") : "idle",
        };
      });

      for (let i = 0; i < missEvents; i++) {
        spawnDamageRef.current?.(
          0,
          playerXRef.current,
          playerYRef.current,
          "miss",
        );
      }

      for (const { damage, attackerX } of attackEvents) {
        damagePlayerRef.current(damage, SUMMON_DAMAGE_KIND, attackerX);
        spawnDamageRef.current?.(
          damage,
          playerXRef.current,
          playerYRef.current,
          "summon",
        );
      }
      if (attackEvents.length > 0) {
        timeRef.current = applyHitstop(timeRef.current, 40);
      }

      setSummonsRef.current(next);
    }, 20);

    return () => clearInterval(interval);
  }, [
    timeRef,
    spawnDamageRef,
    damagePlayerRef,
    difficultyRef,
    isPausedRef,
    npcLevelRef,
    playerCharacterRef,
    playerClassRef,
    playerXRef,
    playerYRef,
    summonsRef,
    setSummonsRef,
    freezeUntilRef,
    rootedSummonsUntilRef,
    honoredFleeRef,
    petBlindRef,
  ]);

  useEffect(() => {
    // Poda de timers órfãos: um rewind (ou outra fonte) pode ter revivido o
    // summon antes dos 500ms — só remove quem continua morto no array.
    const byId = new Map<string, SummonedNpc>(summons.map((s) => [s.id, s]));
    for (const id of Object.keys(deathTimersRef.current)) {
      const current = byId.get(id);
      if (!current || current.hp > 0) {
        const timer = deathTimersRef.current[id];
        if (timer) clearTimeout(timer);
        delete deathTimersRef.current[id];
      }
    }

    const dying = summons.filter((summon) => summon.hp <= 0 && !summon.isDying);

    if (dying.length === 0) {
      return;
    }

    dying.forEach(() => onSummonKilledRef.current?.());

    for (const summon of dying) {
      if (deathTimersRef.current[summon.id]) continue;

      setSummons((prev) =>
        prev.map((s) => (s.id === summon.id ? { ...s, isDying: true } : s)),
      );

      deathTimersRef.current[summon.id] = setTimeout(() => {
        delete deathTimersRef.current[summon.id];
        setSummons((prev) => prev.filter((s) => s.id !== summon.id));
      }, 500);
    }
  }, [summons, setSummons, onSummonKilledRef]);

  // Limpeza dos timers pendentes no unmount da batalha.
  useEffect(() => {
    return () => {
      for (const id of Object.keys(deathTimersRef.current)) {
        const timer = deathTimersRef.current[id];
        if (timer) clearTimeout(timer);
      }
      deathTimersRef.current = {};
    };
  }, []);
}
