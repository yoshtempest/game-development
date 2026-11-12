import { useState } from "react";

import { useAudio } from "@/hooks/audio/useAudio";
import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import { useStableCallback } from "@/hooks/useStableCallback";
import { useGameControlsLayer } from "@/hooks/game/useGameControlsLayer";
import { BGM_COLUMN, SFX_COLUMN, VOLUME_STEP } from "./configConstants";

type VolumeColumn = typeof SFX_COLUMN | typeof BGM_COLUMN;

function clampVolume(value: number): number {
  return Math.min(Math.max(value, 0), 100);
}

/**
 * Controle de volume (SFX/BGM) para telas fora da config de exploração —
 * hoje, as configurações da batalha.
 *
 * Usa o mesmo `useAudio` da config de exploração, então o valor é um só para o
 * jogo inteiro. As teclas espelham a exploração: ◀/▶ trocam entre SFX e BGM,
 * ▲/▼ sobem/descem o volume. A camada **não** define `onCancel`/`onConfirm`:
 * eles caem na camada do menu da batalha, que é quem sabe voltar para a lista
 * de opções.
 *
 * @param enabled - Liga a camada de controles; desligada, só os handlers de
 * clique continuam valendo.
 */
export function useVolumeControls(enabled: boolean) {
  const { sfxVolume, bgmVolume, setSfxVolume, setBgmVolume } = useAudio();
  const { playMove } = useMenuSFX();
  const [selectedColumn, setSelectedColumn] =
    useState<VolumeColumn>(SFX_COLUMN);

  const changeSfx = useStableCallback((delta: number) => {
    setSfxVolume(clampVolume(sfxVolume + delta));
  });
  const changeBgm = useStableCallback((delta: number) => {
    setBgmVolume(clampVolume(bgmVolume + delta));
  });

  const changeSelected = useStableCallback((delta: number) => {
    playMove();
    if (selectedColumn === SFX_COLUMN) changeSfx(delta);
    else changeBgm(delta);
    return true;
  });

  const toggleColumn = useStableCallback(() => {
    playMove();
    setSelectedColumn((prev) =>
      prev === SFX_COLUMN ? BGM_COLUMN : SFX_COLUMN,
    );
    return true;
  });

  const onUp = useStableCallback(() => changeSelected(VOLUME_STEP));
  const onDown = useStableCallback(() => changeSelected(-VOLUME_STEP));

  useGameControlsLayer(
    enabled
      ? { onUp, onDown, onLeft: toggleColumn, onRight: toggleColumn }
      : null,
    [enabled],
  );

  return {
    sfxVolume,
    bgmVolume,
    selectedColumn,
    onSfxDown: () => changeSfx(-VOLUME_STEP),
    onSfxUp: () => changeSfx(VOLUME_STEP),
    onBgmDown: () => changeBgm(-VOLUME_STEP),
    onBgmUp: () => changeBgm(VOLUME_STEP),
  };
}
