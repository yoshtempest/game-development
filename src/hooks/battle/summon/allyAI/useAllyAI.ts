import type { Props } from "./types";
import { useEffect, useRef } from "react";

import { useLatestRef } from "@/hooks/useLatestRef";
import { NPCS } from "@/data/npc";
import { getNpcStats } from "@/gameRules/npc/npcStats";
import { getNpcElementTypes } from "@/data/types/npcElementTypes";
import { combatService } from "@/services/combat";
import { atLeastMinDamage } from "@/gameRules/battle/damage/minDamage";


import {
  applyHitstop,
  getTime,
  scaleCooldown,
} from "@/gameRules/battle/time";

type EnemyTarget = {
  id: string;
  npcType: string;
  x: number;
  y: number;
};



const ALLY_ATTACK_COOLDOWN = 800;
const ALLY_ATTACK_RANGE = 55;
const ALLY_MOVE_SPEED = 3;

export function useAllyAI({
  allies,
  setAllies,
  enemySummons,
  setEnemySummons,
  isPaused,
  isEnding,
  enemyNpc,
  npcHp,
  npcArmor,
  setNpcHP,
  npcLevel,
  difficulty,
  spawnDamageRef,
  timeRef,
}: Props) {
  const allyLastAttacksRef = useRef<Record<string, number>>({});

  // Timers de remoção dos allies mortos, por id (500ms da animação de dying).
  // Guardar em ref evita que o re-run imediato do effect (a marcação de
  // `isDying` troca `allies` e re-dispara o effect) limpe o timer no cleanup
  // — antes, o cleanup cancelava o timer e o re-run não re-agendava nada, então
  // o ally ficava em `isDying` para sempre. A limpeza fica só no unmount.
  const deathTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );

  const alliesRef = useLatestRef(allies);
  const isPausedRef = useLatestRef(isPaused);
  const isEndingRef = useLatestRef(isEnding);
  const enemyNpcRef = useLatestRef(enemyNpc);
  const enemySummonsRef = useLatestRef(enemySummons);
  const npcHpRef = useLatestRef(npcHp);
  const npcArmorRef = useLatestRef(npcArmor);
  const setNpcHPRef = useLatestRef(setNpcHP);
  const setAlliesRef = useLatestRef(setAllies);
  const setEnemySummonsRef = useLatestRef(setEnemySummons);
  const npcLevelRef = useLatestRef(npcLevel);
  const difficultyRef = useLatestRef(difficulty);
  const spawnDamageRefRef = useLatestRef(spawnDamageRef);
  const timeRefRef = useLatestRef(timeRef);

  useEffect(() => {
    // Sem allies em campo nem vale a pena montar a lista de alvos — e o
    // `compare` no fim evita que `[].map()` re-renderize a batalha 50×/s.
    const apply = (
      prev: SummonedNpc[],
      map: (a: SummonedNpc) => SummonedNpc,
    ) => {
      const next = prev.map(map);
      return next.every((a, i) => a === prev[i]) ? prev : next;
    };

    const interval = setInterval(() => {
      if (isPausedRef.current) return;
      if (isEndingRef.current) return;
      if (alliesRef.current.length === 0) return;

      const enemies: EnemyTarget[] = [];
      if (npcHpRef.current > 0) {
        enemies.push({ ...enemyNpcRef.current, id: "main" });
      }
      enemies.push(
        ...enemySummonsRef.current
          .filter((s) => !s.isDying && s.hp > 0)
          .map((s) => ({
            id: s.id,
            npcType: s.npcType,
            x: s.x,
            y: s.y,
          })),
      );

      if (enemies.length === 0) return;

      const statsCache = new Map<string, ReturnType<typeof getNpcStats>>();

      const getAllyDamage = (ally: SummonedNpc, enemyType: string) => {
        const data = NPCS[ally.npcType];
        if (!data) return null;

        const key = `${ally.npcType}_${ally.level ?? npcLevelRef.current}_${ally.statMultiplier ?? 1}`;
        let stats = statsCache.get(key);
        if (!stats) {
          stats = getNpcStats(
            ally.level ?? npcLevelRef.current,
            data.class,
            difficultyRef.current,
            ally.statMultiplier ?? 1,
            ally.npcType,
          );
          statsCache.set(key, stats);
        }

        const elementMultiplier = combatService.getElementMultiplier(
          getNpcElementTypes(ally.npcType),
          getNpcElementTypes(enemyType),
        );

        return atLeastMinDamage(
          combatService.calculateDamageToNpc(
            stats.damage,
            "physical",
            npcArmorRef.current,
          ) * elementMultiplier,
        );
      };

      // O dano é aplicado FORA do updater: `setNpcHP`/`setEnemySummons`
      // dentro do updater de `setAllies` dispara setState de outros
      // componentes durante o render da batalha (o "Cannot update a
      // component while rendering a different component"). O tick coleta os
      // golpes na passada pura e aplica depois do commit.
      const attackEvents: { target: EnemyTarget; damage: number }[] = [];

      const next = apply(alliesRef.current, (ally) => {
        if (ally.isDying || ally.hp <= 0) return ally;

        // Regra de time: a classe decide, o ally é isento só se o efeito
        // listar o id dele em `exempt`.
        const time = getTime(timeRefRef.current.current, "ally", ally.id);
        if (time.speed === 0) return ally;

        const nearest = enemies.reduce<EnemyTarget | null>((best, e) => {
          const d = Math.hypot(e.x - ally.x, e.y - ally.y);
          if (!best) return e;
          const bd = Math.hypot(best.x - ally.x, best.y - ally.y);
          return d < bd ? e : best;
        }, null);

        if (!nearest) return ally;

        const dx = nearest.x - ally.x;
        const dist = Math.abs(dx);
        const direction: "left" | "right" = dx > 0 ? "right" : "left";

        let newX = ally.x;

        if (dist > ALLY_ATTACK_RANGE) {
          const moveStep = ALLY_MOVE_SPEED * time.speed;
          newX += dx > 0 ? moveStep : -moveStep;
        } else {
          const now = Date.now();
          const lastAttack = allyLastAttacksRef.current[ally.id] ?? 0;

          if (now - lastAttack >= scaleCooldown(time, ALLY_ATTACK_COOLDOWN)) {
            allyLastAttacksRef.current[ally.id] = now;

            const damage = getAllyDamage(ally, nearest.npcType);

            if (damage !== null && damage > 0) {
              attackEvents.push({ target: nearest, damage });
            }
          }
        }

        return {
          ...ally,
          x: newX,
          direction,
          state: dist > 80 ? "walk" : "idle",
        };
      });

      for (const { target, damage } of attackEvents) {
        if (target.id === "main") {
          setNpcHPRef.current((hp) => Math.max(0, hp - damage));
        } else {
          setEnemySummonsRef.current((prev) =>
            prev.map((s) =>
              s.id === target.id ? { ...s, hp: Math.max(0, s.hp - damage) } : s,
            ),
          );
        }
        spawnDamageRefRef.current.current?.(damage, target.x, target.y, "ally");
      }
      if (attackEvents.length > 0) {
        timeRefRef.current.current = applyHitstop(
          timeRefRef.current.current,
          20,
        );
      }

      setAlliesRef.current(next);
    }, 20);

    return () => clearInterval(interval);
  }, [
    isPausedRef,
    isEndingRef,
    alliesRef,
    enemyNpcRef,
    enemySummonsRef,
    npcHpRef,
    npcArmorRef,
    setNpcHPRef,
    setAlliesRef,
    setEnemySummonsRef,
    npcLevelRef,
    difficultyRef,
    spawnDamageRefRef,
    timeRefRef,
  ]);

  useEffect(() => {
    // Poda de timers órfãos: um rewind (ou outra fonte) pode ter revivido o
    // ally antes dos 500ms — só remove quem continua morto no array.
    const byId = new Map<string, SummonedNpc>(allies.map((a) => [a.id, a]));
    for (const id of Object.keys(deathTimersRef.current)) {
      const current = byId.get(id);
      if (!current || current.hp > 0) {
        const timer = deathTimersRef.current[id];
        if (timer) clearTimeout(timer);
        delete deathTimersRef.current[id];
      }
    }

    const dying = allies.filter((a) => a.hp <= 0 && !a.isDying);

    if (dying.length === 0) return;

    for (const ally of dying) {
      if (deathTimersRef.current[ally.id]) continue;

      setAllies((prev) =>
        prev.map((a) => (a.id === ally.id ? { ...a, isDying: true } : a)),
      );

      deathTimersRef.current[ally.id] = setTimeout(() => {
        delete deathTimersRef.current[ally.id];
        setAllies((prev) => prev.filter((a) => a.id !== ally.id));
      }, 500);
    }
  }, [allies, setAllies]);

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
