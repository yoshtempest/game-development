import { useEffect, useRef, useState } from "react";

import { playerPathArturHabilities, npcPathProjectile } from "@/utils/paths";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { getProjectileCenter } from "@/gameRules/npc/projectile/projectileDamage";
import { isProjectileId } from "@/gameRules/npc/projectile/projectileId";
import {
  applyTime,
  clearTime,
  freezeWorldSpec,
  type TimeEffect,
} from "@/gameRules/battle/time";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import type { ProjectileStrike } from "@/utils/types/battle/projectileHit";
import type {
  KillerQueenOverlay,
  EnemyTarget,
} from "@/utils/types/character/srGuaxinim";
import {
  DEFAULT_OVERLAY,
  BEHIND_X_OFFSET,
  SPAWN_X_OFFSET,
  TOTAL_FREEZE_MS,
  KILLER_QUEEN_TIME_ID,
  KILLER_QUEEN_SPRITE_FILE,
} from "@/data/characters/artur/srGuaxinim";

type Props = {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  /** NPC principal + summons: alvos que levam dano de área. */
  enemies: EnemyTarget[];
  /** Projéteis do NPC: congelados e transformados em bomba. */
  projectiles: Projectile[];
  /** Efeitos de time da batalha (regra `gameRules/battle/time`). */
  timeRef: React.RefObject<TimeEffect[]>;
  /** O player não é `TimeKind`: o lock de ação dele é o `freezeActionsUntilRef`. */
  freezePlayerUntilRef: React.RefObject<number>;
  /** Aplica o dano de área da explosão nos projéteis que viraram bomba. */
  onBombProjectiles: (strikes: ProjectileStrike[]) => void;
  onAreaDamage: (
    explosions: { x: number; y: number }[],
    allEnemies: EnemyTarget[],
  ) => void;
};

export function useArturKillerQueen({
  player,
  setPlayer,
  enemies,
  projectiles,
  timeRef,
  freezePlayerUntilRef,
  onBombProjectiles,
  onAreaDamage,
}: Props) {
  const [killerQueen, setKillerQueen] =
    useState<KillerQueenOverlay>(DEFAULT_OVERLAY);
  const [bombTargets, setBombTargets] = useState<BombTarget[]>([]);

  const { playSound } = useSoundEffects();

  const runningRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const onAreaDamageRef = useRef(onAreaDamage);
  onAreaDamageRef.current = onAreaDamage;
  const onBombProjectilesRef = useRef(onBombProjectiles);
  onBombProjectilesRef.current = onBombProjectiles;
  const timeRefRef = useRef(timeRef);
  timeRefRef.current = timeRef;
  const freezePlayerUntilRefRef = useRef(freezePlayerUntilRef);
  freezePlayerUntilRefRef.current = freezePlayerUntilRef;

  useEffect(() => {
    const isArtur = player.character === "artur";
    const isActive = ALL_PREDICATES.isSpecialTrigger(player.state);

    if (!isArtur || !isActive || runningRef.current) return;

    runningRef.current = true;

    const timers = timersRef.current;
    const delay = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, ms));
      });

    const isRight = player.battleDirection === "right";
    const playerSideX = player.x + (isRight ? SPAWN_X_OFFSET : -SPAWN_X_OFFSET);
    const playerSideFlip = !isRight;
    const behindX = (e: EnemyTarget) =>
      e.x >= player.x ? e.x + BEHIND_X_OFFSET : e.x - BEHIND_X_OFFSET;
    const behindFlip = (e: EnemyTarget) => e.x >= player.x;

    const done = Date.now() + TOTAL_FREEZE_MS;
    // Regra de time: um único efeito congela o mundo inteiro (npc, summons,
    // allies, pet e projéteis). O player fica de fora do `TimeKind` — o lock
    // de ação dele é o `freezeActionsUntilRef`, compartilhado por outras
    // habilidades.
    timeRefRef.current.current = applyTime(
      timeRefRef.current.current,
      freezeWorldSpec(KILLER_QUEEN_TIME_ID, TOTAL_FREEZE_MS),
    );
    freezePlayerUntilRefRef.current.current = done;

    // Snapshot dos alvos no instante em que o special começa: inimigos +
    // projéteis destrutíveis. A partir daqui os projéteis ficam congelados, então
    // as posições não mudam mais durante a sequência.
    const targets: EnemyTarget[] = [
      ...enemies,
      ...projectiles
        .filter((p) => !p.indestructible)
        .map((p) => ({ id: p.id, ...getProjectileCenter(p) })),
    ];

    void (async () => {
      try {
        setKillerQueen({
          active: true,
          x: playerSideX,
          y: player.y,
          sprite: "idle",
          opacity: 0,
          flip: playerSideFlip,
        });
        await delay(30);
        setKillerQueen((q) => ({ ...q, opacity: 1 }));
        await delay(350);
        setKillerQueen((q) => ({ ...q, opacity: 0 }));

        const bombed: BombTarget[] = [];
        const bombedProjectileIds: string[] = [];
        for (const enemy of targets) {
          const recall = window.setTimeout(() => {
            setKillerQueen({
              active: true,
              x: behindX(enemy),
              y: enemy.y,
              sprite: "idle",
              opacity: 0,
              flip: behindFlip(enemy),
            });
            // Apareceu atrás de um alvo (teleporte) -> blink.mp3
            playSound("blink");
          }, 260);
          timers.push(recall);
          await delay(260);

          setKillerQueen((q) => ({ ...q, opacity: 1 }));
          await delay(280);
          setKillerQueen((q) => ({ ...q, sprite: "touch" }));
          await delay(200);

          bombed.push({
            id: enemy.id,
            x: enemy.x,
            y: enemy.y,
            phase: "bomb",
          });
          if (isProjectileId(enemy.id)) bombedProjectileIds.push(enemy.id);
          setBombTargets([...bombed]);
          setKillerQueen((q) => ({ ...q, opacity: 0 }));
          await delay(250);
        }

        setKillerQueen({
          active: true,
          x: playerSideX,
          y: player.y,
          sprite: "prePalm",
          opacity: 0,
          flip: playerSideFlip,
        });
        await delay(30);
        setKillerQueen((q) => ({ ...q, opacity: 1 }));
        await delay(250);
        setKillerQueen((q) => ({ ...q, sprite: "palm" }));
        await delay(150);

        setBombTargets((prev) =>
          prev.map((b) => ({ ...b, phase: "explosion" })),
        );
        // Dano de área da explosão: os projéteis bomba levam o dano real do
        // special (mesmo pipeline dos inimigos) e só somem se o dano zerar o
        // HP — quem explode é a própria bomba que nasceu no projétil.
        onBombProjectilesRef.current(
          bombedProjectileIds.map((id) => {
            const target = targets.find((t) => t.id === id);
            const count = Math.max(
              1,
              bombed.filter(
                (b) =>
                  target != null &&
                  Math.hypot(target.x - b.x, target.y - b.y) <= 200,
              ).length,
            );
            return { id, multiplier: count };
          }),
        );
        onAreaDamageRef.current(
          bombed
            .filter((b) => !isProjectileId(b.id))
            .map((b) => ({ x: b.x, y: b.y })),
          enemies,
        );

        await delay(450);

        const unfreeze = Date.now();
        timeRefRef.current.current = clearTime(
          timeRefRef.current.current,
          KILLER_QUEEN_TIME_ID,
        );
        freezePlayerUntilRefRef.current.current = unfreeze;

        setKillerQueen((q) => ({ ...q, opacity: 0 }));
        await delay(250);
        setBombTargets([]);
        setKillerQueen(DEFAULT_OVERLAY);
        setPlayer((p) => ({ ...p, state: "idle" }));
      } finally {
        freezePlayerUntilRefRef.current.current = Date.now();
        timeRefRef.current.current = clearTime(
          timeRefRef.current.current,
          KILLER_QUEEN_TIME_ID,
        );
        runningRef.current = false;
        timersRef.current = [];
      }
    })();
  }, [
    player.character,
    player.battleDirection,
    player.x,
    player.y,
    player.state,
    setPlayer,
    enemies,
    projectiles,
    playSound,
  ]);

  useEffect(() => {
    return () => {
      freezePlayerUntilRefRef.current.current = Date.now();
      timeRefRef.current.current = clearTime(
        timeRefRef.current.current,
        KILLER_QUEEN_TIME_ID,
      );
    };
  }, []);

  return {
    killerQueen,
    bombTargets,
    killerQueenSprite: (sprite: KillerQueenOverlay["sprite"]) =>
      playerPathArturHabilities(
        `/bitesTheDust/${KILLER_QUEEN_SPRITE_FILE[sprite]}.svg`,
      ),
    bombSprite: npcPathProjectile("/bomb.svg"),
    explosionSprite: npcPathProjectile("/explosion.svg"),
  };
}
