import { useMemo } from "react";
import { getElementChart } from "@/gameRules/battle/elementRelations";
import type { ElementType } from "@/utils/types/battle/element";
import styles from "./styles.module.css";
import { elementBadgePath } from "@/utils/paths/icons/elementBadgePath";

/**
 * Ícone do elemento.
 *
 * O asset é minúsculo (`pyrus.svg`) e o `ElementType` é capitalizado
 * (`Pyrus`), então a baixa é feita aqui — toda tabela e todo badge que
 * resuelve elemento passa por este componente.
 */
function ElementBadge({ element }: { element: ElementType }) {
  return (
    <img
      src={elementBadgePath(`${element.toLowerCase()}.svg`)}
      alt={element}
      title={element}
      className={styles.icon}
    />
  );
}

/**
 * Célula só com ícones: é a leitura rápida da tabela, o nome fica no `title`
 * do próprio ícone para não repetir 15 vezes o mesmo texto em cada linha.
 */
function IconList({ elements }: { elements: ElementType[] }) {
  if (elements.length === 0) return <span className={styles.none}>—</span>;

  return (
    <span className={styles.list}>
      {elements.map((element) => (
        <ElementBadge key={element} element={element} />
      ))}
    </span>
  );
}

export function ElementChart() {
  const chart = useMemo(() => getElementChart(), []);

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Tabela de tipagens</h2>

      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Tipagem</th>
              <th scope="col" className={styles.superHeader}>
                Super efetivo (1.5x)
              </th>
              <th scope="col">Dano normal (1x)</th>
              <th scope="col" className={styles.weakHeader}>
                Não efetivo (0.5x)
              </th>
            </tr>
          </thead>
          <tbody>
            {chart.map((row) => (
              <tr key={row.attacker}>
                <th scope="row" className={styles.attacker}>
                  <ElementBadge element={row.attacker} />
                  <span>{row.attacker}</span>
                </th>
                <td className={styles.superCell}>
                  <IconList elements={row.superEffective} />
                </td>
                <td>
                  <IconList elements={row.normal} />
                </td>
                <td className={styles.weakCell}>
                  <IconList elements={row.notEffective} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
