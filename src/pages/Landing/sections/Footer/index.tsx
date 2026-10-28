import styles from "./styles.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p>Jomásio Adventures &copy; {new Date().getFullYear()}</p>
      <p className={styles.footerSmall}>
        Feito pelo desenvolvedor Marshadow Benjamin, com carinho e lembranças.
      </p>
    </footer>
  );
}
