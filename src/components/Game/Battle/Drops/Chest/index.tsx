type Props = {
  chestDrop: ChestKeyDropInfo | null;
  keyDrop: ChestKeyDropInfo | null;
};

/**
 * Seção "Baús e Chaves" do modal de vitória. O ícone é o sprite do próprio item
 * sorteado (o registro `ITEMS` já entrega `image` via `chestPath`/`keyPath`),
 * então o baú raro que caiu aparece raro — igual ao `ItemDrops`, que também
 * consome a imagem já resolvida pelo sorteio.
 */
export function ChestDrops({ chestDrop, keyDrop }: Props) {
  if (!chestDrop && !keyDrop) return null;

  return (
    <div className="section">
      <h2 className="sectionTitle">Baús e Chaves</h2>
      <div className="dropsList">
        {chestDrop && (
          <div className="dropItem">
            <img loading="lazy" decoding="async"
              className="dropIcon"
              src={chestDrop.image}
              alt={chestDrop.name}
              title={chestDrop.name}
            />
            <span className="dropName">{chestDrop.name}</span>
          </div>
        )}
        {keyDrop && (
          <div className="dropItem">
            <img loading="lazy" decoding="async"
              className="dropIcon"
              src={keyDrop.image}
              alt={keyDrop.name}
              title={keyDrop.name}
            />
            <span className="dropName">{keyDrop.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
