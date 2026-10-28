type OutroLines = {
  victory: string;
  defeat: string;
};

export const OUTRO_LINES: Record<string, OutroLines> = {
  marshadow: {
    victory: "E vai tomando!",
    defeat: "Não aconteceu nada...",
  },
  babidi: {
    victory: "Éeeeee! Toma essa, seu f#dido!",
    defeat: "Wubba lubba dub dub!",
  },
  camyKaze: {
    victory: "Ai sim!",
    defeat: "PQP!!",
  },
  ematron: {
    victory: "Você não passa de um fracassado.",
    defeat: "...",
  },
  yvel: {
    victory: "Viva a Mazim!!!",
    defeat: "Me ajude Mazim!",
  },
  laricell: {
    victory: "Booya!",
    defeat: "Game Over.",
  },
  samurion: {
    victory: "Ha! Ha! Eu tinha um dente.",
    defeat: "Nem doeu!",
  },
  srGuaxinim: {
    victory: "Stand, farmar aura!",
    defeat: "Killer Queen, bites the dust!",
  },
  natsuki: {
    victory: "Yowai Mo",
    defeat: "Gomen Yamanai...",
  },
  drika: {
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
