import { createBestiary } from "@/utils/bestiary/createBestiary";

export const lagoaGrandeData = createBestiary({
    /* ── Lagoa Grande ── */
    hungryFish: {
        name: "Peixe Faminto",
        description:
        "Peixes mutantes que cresceram demais após se alimentarem de rejeitos químicos na Lagoa Grande.",
        location: "Lagoa Grande",
        attacks: ["Mordida Aquática", "Caudada"],
    },
    hungryCow: {
        name: "Vaca Faminta",
        description:
        "Gado enlouquecido que pasta nas margens da Lagoa Grande. Seus olhos vermelhos não enganam.",
        location: "Lagoa Grande",
        attacks: ["Coice", "Investida"],
    },
    fischer: {
        name: "Fischer",
        description:
        "Um pescador solitário que passou tempo demais no sol. Sua sanidade já foi embora há muito tempo.",
        location: "Lagoa Grande",
        attacks: ["Rede Enroscante", "Anzol Envenenado"],
    },
    leviathan: {
        name: "Leviathan",
        description:
        "A criatura lendária que habita as profundezas do Rio Ness em Lagoa Grande. Poucos viram e sobreviveram.",
        location: "Lagoa Grande",
        attacks: ["Cauda Torrencial", "Mergulho Abissal", "Jato d'Água"],
    },
})