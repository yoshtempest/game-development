import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { usePlayer } from "@/contexts/PlayerContext";
import { useTitles } from "@/contexts/TitleContext";
import { useTombstones } from "@/contexts/TombstoneContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { slotKey } from "@/services/save/slotManager";
import type { RandomEncounterConfig } from "@/utils/types/battle/randomEncounter";
import { pickEncounter } from "./pickEncounter";
import { rollNpcLevel } from "./rollNpcLevel";

export function useRandomEncounter(config: RandomEncounterConfig) {
  const configRef = useLatestRef(config);

  const { player, setPosition } = usePlayer();
  const { getAlfaSpawnBonus } = useTitles();
  const { prepareTombstoneSpawn } = useTombstones();
  const navigate = useNavigate();

  const lastPositionRef = useRef({ x: player.gridX, y: player.gridY });
  const setPositionRef = useLatestRef(setPosition);
  const restoringRef = useRef(false);

  useEffect(() => {
    const { storageKey } = configRef.current;
    const saved = localStorage.getItem(slotKey(storageKey));
    if (!saved) return;

    restoringRef.current = true;
    const parsed = JSON.parse(saved) as {
      x: number;
      y: number;
      direction: Direction;
    };
    const { x, y, direction } = parsed;
    lastPositionRef.current = { x, y };
    setPositionRef.current(x, y, direction);

    requestAnimationFrame(() => {
      setPositionRef.current(x, y, direction);
      localStorage.removeItem(slotKey(storageKey));
      restoringRef.current = false;
    });
  }, [configRef, setPositionRef]);

  const playerRef = useLatestRef(player);

  useEffect(() => {
    const currentPlayer = playerRef.current;
    const { gridX, gridY } = currentPlayer;

    const moved =
      gridX !== lastPositionRef.current.x ||
      gridY !== lastPositionRef.current.y;
    if (!moved) return;

    if (restoringRef.current) {
      lastPositionRef.current = { x: gridX, y: gridY };
      return;
    }

    lastPositionRef.current = { x: gridX, y: gridY };

    if (currentPlayer.mode !== "explore") return;

    const cfg = configRef.current;
    const isBlocked =
      cfg.blockedTiles?.some((t) => t.x === gridX && t.y === gridY) ?? false;
    if (isBlocked) return;

    const savePosition = () => {
      localStorage.setItem(
        slotKey(cfg.storageKey),
        JSON.stringify({
          x: currentPlayer.gridX,
          y: currentPlayer.gridY,
          direction: currentPlayer.direction,
        }),
      );
    };

    if (Math.random() < (cfg.alfaChance ?? 0) * getAlfaSpawnBonus()) {
      const route = pickEncounter(cfg.encounters);
      savePosition();
      if (cfg.locationId) {
        prepareTombstoneSpawn({
          gridX: currentPlayer.gridX,
          gridY: currentPlayer.gridY,
          direction: currentPlayer.direction,
          locationId: cfg.locationId,
        });
      }
      void navigate(route, {
        state: { alfa: true, npcLevel: rollNpcLevel(cfg.npcLevelRange) },
      });
      return;
    }

    if (Math.random() < (cfg.encounterChance ?? 0.02)) {
      savePosition();
      if (cfg.locationId) {
        prepareTombstoneSpawn({
          gridX: currentPlayer.gridX,
          gridY: currentPlayer.gridY,
          direction: currentPlayer.direction,
          locationId: cfg.locationId,
        });
      }
      const route = pickEncounter(cfg.encounters);
      void navigate(route, {
        state: { npcLevel: rollNpcLevel(cfg.npcLevelRange) },
      });
    }
  }, [
    player.gridX,
    player.gridY,
    navigate,
    configRef,
    playerRef,
    getAlfaSpawnBonus,
    prepareTombstoneSpawn,
  ]);
}
