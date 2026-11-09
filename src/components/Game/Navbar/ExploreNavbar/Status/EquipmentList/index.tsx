import { usePlayer } from "@/contexts/PlayerContext";
import { useEquipment } from "@/contexts/EquipmentContext";
import { useNavbar } from "@/contexts/NavbarContext";
import { EQUIPMENT_SLOTS, RANK_COLORS } from "@/data/equipment/definitions";
import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import { useStableCallback } from "@/hooks/useStableCallback";
import styles from "./styles.module.css";
import { equipmentIconPath } from "@/utils/paths";
import { FILTER_LABELS } from "@/utils/equipment/equipmentMenu";

export function EquipmentList() {
  const { player } = usePlayer();
  const character = player.character;
  const { getEquippedItem } = useEquipment();
  const { setScreen } = useNavbar();
  const { playSelect } = useMenuSFX();

  /**
   * Abre o menu de Equipamentos.
   *
   * Passa por `setScreen`, a mesma porta do item "Equipamentos" da navbar: o
   * navbar já está aberto, então é só trocar a tela — fechar e reabrir
   * custaria a animação e o retorno ao menu principal.
   */
  const openEquipmentMenu = useStableCallback(() => {
    playSelect();
    setScreen("equipment");
  });

  return (
    <div className="StatusColumn">
      <div className="statusMainContainer">
        <div className="statusHeader">
          <img loading="lazy" decoding="async" src={equipmentIconPath("all.svg")} />
          <h2 className="StatusTitle">Equipamentos</h2>
        </div>
        <button
          type="button"
          className="statusButton"
          onClick={openEquipmentMenu}
        >
          Ver equipamentos
        </button>
      </div>
      <div className={styles.equipmentGrid}>
        {EQUIPMENT_SLOTS.map((slot) => {
          const item = getEquippedItem(character, slot);
          return (
            <p key={slot} className={styles.fontSize}>
              <img loading="lazy" decoding="async" className="slotTag" src={FILTER_LABELS[slot]} />
              {item ? (
                <span style={{ color: RANK_COLORS[item.rank] }}>
                  {item.name}
                </span>
              ) : (
                <span className={styles.italic}>Vazio</span>
              )}
            </p>
          );
        })}
      </div>
    </div>
  );
}
