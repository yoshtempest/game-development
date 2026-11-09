type Props = {
  visible: boolean;
  onClick: () => void;
};

export function BabidiSelfDestructButton({ visible, onClick }: Props) {
  if (!visible) return null;

  return (
    <button type="button" onClick={onClick} style={{ marginLeft: 8 }}>
      Autodestruição
    </button>
  );
}