import { useRef, useState } from "react";
import type { MouseEvent } from "react";

import { usePlayer } from "@/contexts/PlayerContext";
import { useCharacterProgress } from "@/contexts/CharacterProgressContext";
import { useCharacterMenu } from "@/hooks/menu/useCharacter";
import { useStatusMenu } from "@/hooks/menu/useStatus";
import { useStableCallback } from "@/hooks/useStableCallback";
import { CharacterCard } from "@/components/Game/Navbar/shared/CharacterCard";
import { CharacterInfo } from "@/components/Game/Navbar/ExploreNavbar/Status/CharacterInfo";
import { AvailableStats } from "@/components/Game/Navbar/ExploreNavbar/Status/AvailableStats";
import { EquipmentList } from "@/components/Game/Navbar/ExploreNavbar/Status/EquipmentList";
import { CharacterAbilities } from "@/components/Game/Navbar/ExploreNavbar/Status/CharacterAbilities";

import styles from "./styles.module.css";
import statusStyles from "@/components/Game/Navbar/ExploreNavbar/Status/styles.module.css";

type Props = {
  /** A entrada da navbar define qual das duas telas aparece primeiro. */
  initialView: "grid" | "status";
};

/**
 * Menu fundido de Personagem + Status.
 *
 * A grade é a porta de entrada: o botão "Status" de cada card troca a tela
 * para os detalhes daquele personagem. O atalho interno `status` entra direto
 * nos detalhes do personagem em uso, sem perder a navegação de volta à grade.
 */
export function CharacterStatus({ initialView }: Props) {
  const [view, setView] = useState(initialView);
  const listRef = useRef<HTMLDivElement>(null);
  const { player } = usePlayer();
  const { progress } = useCharacterProgress();

  const {
    characters,
    selectableCharacters,
    selectedIndex,
    statusFor,
    openStatus,
    closeStatus,
  } = useCharacterMenu(view === "grid", listRef);

  const statusCharacterId = statusFor ?? player.character;

  const backToGrid = useStableCallback(() => {
    closeStatus();
    setView("grid");
  });

  const { selectedIndex: statIndex, selectStat, confirmStat, clearStat } =
    useStatusMenu(view === "status", statusCharacterId, backToGrid);

  /**
   * A face escolhida define o personagem inspecionado, não o personagem em uso.
   * Limpar o stat antes da troca evita que um ponto marcado para A seja gasto
   * em B se o jogador confirmar logo depois de mudar de face.
   */
  const showStatusFor = useStableCallback((id: CharacterId) => {
    clearStat();
    openStatus(id);
  });

  /**
   * Clique fora de um stat ou do Confirmar limpa a escolha, sem gastar ponto.
   * A checagem usa atributos em vez de classes do CSS module (hasheadas).
   */
  const onAreaClick = useStableCallback((event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("[data-stat-row], [data-confirm]")) return;
    clearStat();
  });

  if (view === "grid") {
    return (
      <div
        ref={listRef}
        className={`containerOfNavbar ${styles.charactersContainer}`}
      >
        {characters.map((char) => {
          const selectableIndex = selectableCharacters.findIndex(
            (c) => c.name === char.name,
          );
          const charProgress = progress[char.image];
          const isSelected = selectableIndex === selectedIndex;

          return (
            <CharacterCard
              key={char.name}
              character={char}
              isSelected={isSelected}
              progress={charProgress}
              onShowStatus={(id) => {
                openStatus(id);
                setView("status");
              }}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="containerOfNavbar" onClick={onAreaClick}>
      <div className={statusStyles.flexRow}>
        <CharacterInfo characterId={statusCharacterId} />
        <div
          className={`${statusStyles.flexRow} ${statusStyles.statsAndEquipment} ${statusStyles.rightColumn}`}
        >
          <AvailableStats
            characterId={statusCharacterId}
            selectedIndex={statIndex}
            onSelectStat={selectStat}
            onConfirmStat={confirmStat}
            onSelectCharacter={showStatusFor}
          />
          <EquipmentList characterId={statusCharacterId} />
          <CharacterAbilities characterId={statusCharacterId} />
        </div>
      </div>
    </div>
  );
}

export function Character() {
  return <CharacterStatus initialView="grid" />;
}

export function Status() {
  return <CharacterStatus initialView="status" />;
}
