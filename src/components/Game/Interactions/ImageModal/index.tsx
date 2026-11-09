import styles from "./styles.module.css";
import { resolveAsset } from "@/utils/paths";
import Talking from "@/components/Game/Interactions/Talking";

type Props = {
  src: string;
  message?: string;
  name?: string;
  onClose: () => void;
};

export function ImageModal({ src, message, name = "Sistema", onClose }: Props) {
  // Gif é sprite transparente (ex.: macaco girando): a moldura da imagem
  // ficaria em volta do nada, então a variante gif remove borda/sombra.
  const isGif = src.endsWith(".gif");

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <img loading="lazy" decoding="async"
        className={isGif ? `${styles.image} ${styles.gif}` : styles.image}
        src={resolveAsset(src)}
        alt=""
        onClick={(e) => e.stopPropagation()}
      />
      {message && <Talking name={name} message={message} onNext={onClose} />}
    </div>
  );
}
