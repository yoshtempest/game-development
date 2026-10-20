import { useCallback, useEffect, useRef, useState } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { placeLootBags } from "@/gameRules/battle/loot/buildLootBags";
import { BATTLE_LOOT_WINDOW_MS } from "@/data/battle/lootbags";
import { clampX } from "@/gameRules/movement/clampX";
import type { BattleLootBag, LootBagContents } from "@/utils/types/battle/loot";
import type { PetState } from "@/hooks/battle/player/pets/usePet";
import type { SoundId } from "@/utils/audio/soundId";

const TICK_MS = 20;
const PLAYER_PICKUP_RADIUS = 70;
const PET_BAG_REACH = 45;
const PET_FETCH_SPEED = 250;
const BAG_MARGIN = 40;
const PICKUP_DELAY_MS = 900;
const DROP_DURATION_MS = 800;
const DROP_ARC_HEIGHT = 80;

type Props = {
  playerX: number;
  playerY: number;
  pet: PetState;
  setPet: React.Dispatch<React.SetStateAction<PetState>>;
  isPausedRef: React.RefObject<boolean>;
  onCollect: (contents: LootBagContents) => void;
  onNotify: (contents: LootBagContents, x: number, y: number) => void;
  onDone: () => void;
  playSound: (id: SoundId) => void;
};

function speedStep(speed: number, tickMs: number) {
  return speed / (1000 / tickMs);
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function useBattleLoot({
  playerX,
  playerY,
  pet,
  setPet,
  isPausedRef,
  onCollect,
  onNotify,
  onDone,
  playSound,
}: Props) {
  const [bags, setBags] = useState<BattleLootBag[]>([]);
  const [isActive, setIsActive] = useState(false);
  const isActiveRef = useRef(false);

  const playerXRef = useLatestRef(playerX);
  const playerYRef = useLatestRef(playerY);
  const petRef = useLatestRef(pet);
  const onCollectRef = useLatestRef(onCollect);
  const onNotifyRef = useLatestRef(onNotify);
  const onDoneRef = useLatestRef(onDone);
  const playSoundRef = useLatestRef(playSound);

  const bagsRef = useLatestRef(bags);

  const doneRef = useRef(false);
  const collectedIdsRef = useRef<Set<number>>(new Set());
  const activeMsRef = useRef(0);
  const lastTickRef = useRef(0);
  const startedAtRef = useRef(0);

  const fetchPhaseRef = useRef<"idle" | "toBag" | "dragBack">("idle");
  const targetBagIdRef = useRef<number | null>(null);

  const start = useCallback(
    (contents: LootBagContents[], spawnX: number, spawnY: number) => {
      doneRef.current = false;
      collectedIdsRef.current = new Set();
      activeMsRef.current = 0;
      fetchPhaseRef.current = "idle";
      targetBagIdRef.current = null;
      const now = Date.now();
      lastTickRef.current = now;
      startedAtRef.current = now;
      setBags(
        placeLootBags(contents, spawnX, spawnY).map((b) => {
          const targetX = clampX(b.targetX, BAG_MARGIN);
          const targetY = Math.max(BAG_MARGIN, b.targetY);
          return {
            ...b,
            targetX,
            targetY,
            x: spawnX,
            y: spawnY,
            dropStartAt: now,
            dropDuration: DROP_DURATION_MS,
          };
        }),
      );
      isActiveRef.current = true;
      setIsActive(true);
    },
    [],
  );

  const collectBag = useCallback(
    (id: number) => {
      if (collectedIdsRef.current.has(id)) return;
      const bag = bagsRef.current.find((b) => b.id === id);
      if (!bag) return;
      collectedIdsRef.current.add(id);
      setBags((prev) => prev.filter((b) => b.id !== id));
      onCollectRef.current(bag.contents);
      onNotifyRef.current(bag.contents, bag.x, bag.y);
      playSoundRef.current("equip");
    },
    [bagsRef, onCollectRef, onNotifyRef, playSoundRef],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isActiveRef.current || doneRef.current) return;
      if (isPausedRef.current) {
        lastTickRef.current = Date.now();
        return;
      }

      const now = Date.now();
      activeMsRef.current += now - lastTickRef.current;
      lastTickRef.current = now;

      // 0) animação das lootbags saindo do inimigo: sobem em arco e caem no alvo
      if (bagsRef.current.some((b) => now - b.dropStartAt < b.dropDuration)) {
        setBags((prev) =>
          prev.map((b) => {
            const elapsed = now - b.dropStartAt;
            if (elapsed >= b.dropDuration) {
              return { ...b, x: b.targetX, y: b.targetY };
            }
            const t = elapsed / b.dropDuration;
            const eased = easeOutCubic(t);
            return {
              ...b,
              x: b.dropStartX + (b.targetX - b.dropStartX) * eased,
              y:
                b.dropStartY +
                (b.targetY - b.dropStartY) * eased -
                DROP_ARC_HEIGHT * Math.sin(Math.PI * t),
            };
          }),
        );
      }

      const px = playerXRef.current;
      const py = playerYRef.current;
      const step = speedStep(PET_FETCH_SPEED, TICK_MS);

      const pickupReady = Date.now() - startedAtRef.current >= PICKUP_DELAY_MS;

      const openBags = bagsRef.current.filter((b) => b.state === "open");

      // 1) jogador coleta lootbags pisando por cima (após delay inicial)
      if (pickupReady) {
        for (const bag of openBags) {
          if (
            fetchPhaseRef.current === "dragBack" &&
            targetBagIdRef.current === bag.id
          ) {
            continue;
          }
          if (Math.hypot(bag.x - px, bag.y - py) <= PLAYER_PICKUP_RADIUS) {
            collectBag(bag.id);
          }
        }
      }

      if (doneRef.current) return;

      // 2) pet coleta lootbags automaticamente (vai até a lootbag e arrasta) — após delay
      if (pickupReady) {
        const petState = petRef.current;
        if (petState) {
          if (
            fetchPhaseRef.current === "idle" &&
            bagsRef.current.some((b) => b.state === "open")
          ) {
            const candidates = bagsRef.current.filter(
              (b) => b.state === "open",
            );
            const target = candidates.reduce<BattleLootBag>(
              (best, b) =>
                Math.hypot(b.x - petState.x, b.y - petState.y) <
                Math.hypot(best.x - petState.x, best.y - petState.y)
                  ? b
                  : best,
              candidates[0]!,
            );
            targetBagIdRef.current = target.id;
            fetchPhaseRef.current = "toBag";
          }

          if (
            fetchPhaseRef.current === "toBag" &&
            targetBagIdRef.current != null
          ) {
            const targetBag = bagsRef.current.find(
              (b) => b.id === targetBagIdRef.current && b.state === "open",
            );
            if (!targetBag) {
              fetchPhaseRef.current = "idle";
              targetBagIdRef.current = null;
            } else {
              const dx = targetBag.x - petState.x;
              const dy = targetBag.y - petState.y;
              const dist = Math.hypot(dx, dy);
              if (dist <= PET_BAG_REACH) {
                setBags((prev) =>
                  prev.map((b) =>
                    b.id === targetBag.id ? { ...b, state: "beingDragged" } : b,
                  ),
                );
                fetchPhaseRef.current = "dragBack";
                setPet((prev) => (prev ? { ...prev, state: "idle" } : prev));
              } else {
                const nextX =
                  dist <= step ? targetBag.x : petState.x + (dx / dist) * step;
                const nextY =
                  dist <= step ? targetBag.y : petState.y + (dy / dist) * step;
                setPet({
                  ...petState,
                  x: nextX,
                  y: nextY,
                  direction: dx > 0 ? "right" : "left",
                  state: "walk",
                });
              }
            }
          }

          if (
            fetchPhaseRef.current === "dragBack" &&
            targetBagIdRef.current != null
          ) {
            const dragBag = bagsRef.current.find(
              (b) => b.id === targetBagIdRef.current,
            );
            if (dragBag) {
              if (
                Math.hypot(dragBag.x - px, dragBag.y - py) <=
                PLAYER_PICKUP_RADIUS
              ) {
                collectBag(dragBag.id);
                fetchPhaseRef.current = "idle";
                targetBagIdRef.current = null;
                setPet((prev) => (prev ? { ...prev, state: "idle" } : prev));
              } else {
                const dx = px - petState.x;
                const dy = py - petState.y;
                const dist = Math.hypot(dx, dy);
                const nextX =
                  dist <= step ? px : petState.x + (dx / dist) * step;
                const nextY =
                  dist <= step ? py : petState.y + (dy / dist) * step;
                setPet({
                  ...petState,
                  x: nextX,
                  y: nextY,
                  direction: dx > 0 ? "right" : "left",
                  state: "walk",
                });
                setBags((prev) =>
                  prev.map((b) =>
                    b.id === dragBag.id ? { ...b, x: nextX, y: nextY } : b,
                  ),
                );
              }
            } else {
              fetchPhaseRef.current = "idle";
              targetBagIdRef.current = null;
            }
          }
        }
      }

      // 3) fim da janela de coleta: concede o restante e finaliza a vitória
      if (activeMsRef.current >= BATTLE_LOOT_WINDOW_MS) {
        doneRef.current = true;
        isActiveRef.current = false;
        if (bagsRef.current.length > 0) {
          for (const bag of bagsRef.current) {
            collectBag(bag.id);
          }
        }
        setBags([]);
        setIsActive(false);
        onDoneRef.current();
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [
    isPausedRef,
    playerXRef,
    playerYRef,
    petRef,
    bagsRef,
    collectBag,
    onDoneRef,
    onNotifyRef,
    setPet,
  ]);

  return { bags, isActive, start };
}
