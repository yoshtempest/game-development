import { useEffect, useState } from "react";
import styles from "./styles.module.css";

type Props = {
  roomId: string;
};

type HostInfo = { addresses: string[] };

/**
 * Monta o endereço que os amigos abrem no navegador: o IP da rede local desta
 * máquina com a mesma porta e o mesmo subpath em que o jogo está rodando.
 *
 * @param address IPv4 da rede local.
 * @returns URL completa do jogo nesse IP.
 */
function gameUrlFor(address: string): string {
  const { protocol, port } = window.location;
  const portPart = port ? `:${port}` : "";
  return `${protocol}//${address}${portPart}${import.meta.env.BASE_URL}`;
}

/**
 * Código da sala e endereço do host para o dono compartilhar (#539), sem
 * precisar rodar `ipconfig`. O backend é opcional: sem ele a lista de IPs fica
 * vazia e só o código aparece.
 */
export function RoomShareInfo({ roomId }: Props) {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/online/host-info")
      .then((res) => (res.ok ? (res.json() as Promise<HostInfo>) : null))
      .then((info) => {
        if (!cancelled && info) setAddresses(info.addresses);
      })
      .catch(() => {
        if (!cancelled) setAddresses([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(null), 1500);
    return () => clearTimeout(id);
  }, [copied]);

  const copy = (value: string) => {
    void navigator.clipboard
      ?.writeText(value)
      .then(() => setCopied(value))
      .catch(() => setCopied(null));
  };

  return (
    <section className={styles.box} aria-label="Compartilhar sala">
      <div className={styles.row}>
        <span className={styles.label}>Código da sala</span>
        <code className={styles.value}>{roomId}</code>
        <button type="button" onClick={() => copy(roomId)}>
          {copied === roomId ? "Copiado!" : "Copiar"}
        </button>
      </div>
      {addresses.map((address) => {
        const url = gameUrlFor(address);
        return (
          <div key={address} className={styles.row}>
            <span className={styles.label}>Seu IP</span>
            <code className={styles.value}>{url}</code>
            <button type="button" onClick={() => copy(url)}>
              {copied === url ? "Copiado!" : "Copiar"}
            </button>
          </div>
        );
      })}
      <p className={styles.hint}>
        Na mesma rede Wi-Fi, o amigo abre o endereço acima, vai em Modo Online e
        entra pela lista ou pelo código.
      </p>
    </section>
  );
}
