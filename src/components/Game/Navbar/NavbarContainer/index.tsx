import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import styles from "./styles.module.css";
import { useBattleNavbar } from "@/contexts/BattleNavbarContext";
import { useNavbar } from "@/contexts/NavbarContext";

type Props = {
  children: ReactNode;
  /** Subtelas com botão de voltar próprio podem desligar o padrão. */
  showBackButton?: boolean;
  onBack?: () => void;
};

/**
 * Moldura compartilhada das telas do navbar: o conteúdo fica dentro do card
 * e o botão Voltar abaixo dele. Quem monta a tela só passa as `children`.
 */
export function NavbarContainer({
  children,
  showBackButton = true,
  onBack,
}: Props) {
  const { closeNavbar } = useNavbar();
  const { isBattleNavOpen, closeBattleNavbar } = useBattleNavbar();

  function handleBack() {
    if (onBack) {
      onBack();
      return;
    }
    if (isBattleNavOpen) {
      closeBattleNavbar();
      return;
    }
    closeNavbar();
  }

  return (
    <div className={`navbarContainerWrapper ${styles.wrapper}`}>
      <div className="containerOfNavbar">{children}</div>
      {showBackButton && (
        <button type="button" className={styles.backButton} onClick={handleBack}>
          <ArrowLeft size={19} strokeWidth={2.2} />
          Voltar
        </button>
      )}
    </div>
  );
}
