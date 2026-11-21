import { Equipment } from "@/components/Game/Navbar/ExploreNavbar/Equipment";
import { useInventoryTabs } from "@/hooks/menu/useInventoryTabs";
import {
  INVENTORY_SECTIONS,
  INVENTORY_SECTION_ICONS,
  INVENTORY_SECTION_LABELS,
  type InventorySection,
} from "@/data/inventory/tabs";
import { InventoryTab } from "./InventoryTab";

type Props = {
  initialSection: InventorySection;
};

function InventoryMenu({ initialSection }: Props) {
  const {
    activeSection,
    isOnTab,
    setActiveSection,
    focusTab,
    enterContent,
  } = useInventoryTabs(initialSection);

  return (
    <div className="containerOfNavbar">
      <div className="tabs">
        {INVENTORY_SECTIONS.map((section) => {
          const Icon = INVENTORY_SECTION_ICONS[section];

          return (
            <button
              key={section}
              type="button"
              className={`tab ${activeSection === section ? "tabActive" : ""}
                ${isOnTab && activeSection === section ? "tabSelected" : ""}`}
              onClick={() => {
                setActiveSection(section);
                enterContent();
              }}
            >
              <Icon size={19} strokeWidth={2.2} />
              <span>{INVENTORY_SECTION_LABELS[section]}</span>
            </button>
          );
        })}
      </div>

      {activeSection === "inventario" ? (
        <InventoryTab isActive={!isOnTab} onFocusTabs={focusTab} />
      ) : (
        <Equipment isActive={!isOnTab} onFocusTabs={focusTab} />
      )}
    </div>
  );
}

export function Inventory() {
  return <InventoryMenu initialSection="inventario" />;
}

export function InventoryEquipment() {
  return <InventoryMenu initialSection="equipamentos" />;
}
