import type { Params } from "./types";
import { useEffect, useRef } from "react";
import { useGameControls } from "@/contexts/GameControlsContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { circularNext, circularPrev } from "@/gameRules/menu/navigation";

export function useRewardsControls({
  chestRewardsVisible,
  rewardOptionCount,
  lastOpened,
  playMove,
  playSelect,
  closeRewards,
  openNextChest,
  onRewardOptionChange,
}: Params) {
  const { pushControls } = useGameControls();
  const rewardOptionIndexRef = useRef(0);
  const rewardOptionCountRef = useLatestRef(rewardOptionCount);
  const lastOpenedRef = useLatestRef(lastOpened);
  const openNextChestRef = useLatestRef(openNextChest);
  const playMoveRef = useLatestRef(playMove);
  const playSelectRef = useLatestRef(playSelect);
  const closeRewardsRef = useLatestRef(closeRewards);

  useEffect(() => {
    if (!chestRewardsVisible) return;

    onRewardOptionChange(0);
    rewardOptionIndexRef.current = 0;

    const controls = {
      onLeft: () => {
        if (rewardOptionCountRef.current <= 1) return true;
        playMoveRef.current();
        onRewardOptionChange((prev) => {
          const next = circularPrev(prev, rewardOptionCountRef.current);
          rewardOptionIndexRef.current = next;
          return next;
        });
        return true;
      },
      onRight: () => {
        if (rewardOptionCountRef.current <= 1) return true;
        playMoveRef.current();
        onRewardOptionChange((prev) => {
          const next = circularNext(prev, rewardOptionCountRef.current);
          rewardOptionIndexRef.current = next;
          return next;
        });
        return true;
      },
      onConfirm: () => {
        playSelectRef.current();
        if (
          rewardOptionCountRef.current > 1 &&
          rewardOptionIndexRef.current === 0
        ) {
          openNextChestRef.current(lastOpenedRef.current?.chestId);
        } else {
          closeRewardsRef.current();
        }
        return true;
      },
      onCancel: () => {
        playSelectRef.current();
        closeRewardsRef.current();
        return true;
      },
    };

    const remove = pushControls(controls);
    return remove;
  }, [
    chestRewardsVisible,
    pushControls,
    onRewardOptionChange,
    closeRewardsRef,
    lastOpenedRef,
    openNextChestRef,
    playMoveRef,
    playSelectRef,
    rewardOptionCountRef,
  ]);
}
