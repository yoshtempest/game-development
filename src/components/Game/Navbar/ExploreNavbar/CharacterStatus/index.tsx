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

import characterStyles from "@/components/Game/Navbar/ExploreNavbar/Character/styles.module.css";
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
        className={`containerOfNavbar ${characterStyles.charactersContainer}`}
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
