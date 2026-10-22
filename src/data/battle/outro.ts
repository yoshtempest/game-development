type OutroLines = {
  victory: string;
  defeat: string;
};

export const OUTRO_LINES: Record<string, OutroLines> = {
  marcelo: {
    victory: "E vai tomando!",
    defeat: "Não aconteceu nada...",
  },
  lucaua: {
    victory: "Éeeeee! Toma essa, seu f#dido!",
    defeat: "Wubba lubba dub dub!",
  },
  camilly: {
    victory: "...",
    defeat: "...",
  },
  emanuel: {
    victory: "Você não passa de um fracassado.",
    defeat: "...",
  },
  lucas: {
    victory: "Viva a Mazim!!!",
    defeat: "Me ajude Mazim!",
  },
  larissa: {
    victory: "Booya!",
    defeat: "Game Over.",
  },
  samuel: {
    victory: "Ha! Ha! Eu tinha um dente.",
    defeat: "Nem doeu!",
  },
  artur: {
    victory: "Stand, farmar aura!",
    defeat: "Killer Queen, bites the dust!",
  },
  riquelme: {
    victory: "Yowai Mo",
    defeat: "Gomen Yamanai...",
  },
  eduarda: {
    victory: "Ebaa!",
    defeat: "Que ódio!",
  },
};

export function getOutroLine(
  character: string,
  type: "victory" | "defeat",
): string {
  return (
    OUTRO_LINES[character]?.[type] ??
    (type === "victory" ? "Vitória!" : "Derrota...")
  );
}
