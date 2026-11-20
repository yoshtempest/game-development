export const HALL_ROUTES = {
  ONE: "/hall/one",
  LEFT_ONE: "/hall/left-one",
  CENTER_ONE: "/hall/center-one",
  CENTER_FRONT: "/hall/center-front",
  JAILSON_ONE: "/hall/jailson-one",
  JAILSON_TWO: "/hall/jailson-two",
  AFTER_PCROOM_ONE: "/hall/afterpcroom-one",
  THIRD_CLASS: "/hall/thirdclass",
  HELL: "/hall/hell",
  PANDEMONY: "/hall/pandemony",
};

export const PCROOM_ROUTES = {
  ONE: "/pcroom/one",
  TWO: "/pcroom/two",
  THREE: "/pcroom/three",
  FOUR: "/pcroom/four",
  FIVE: "/pcroom/five",
  SIX: "/pcroom/six",
  SEVEN: "/pcroom/seven",
};

export const JOMASIO_ENTRANCE_ROUTES = {
  ONE: "/jomasioentrance/one",
};

export const CHAPTER_ROUTES = {
  ONE: "/chapter/one",
};

export const CANTINA_ROUTES = {
  ONE: "/cantina/one",
  TWO: "/cantina/two",
};

/**
 * Batalhas dos vigias que guardam portas. O tile da porta devolve uma destas
 * rotas enquanto o vigia não foi derrotado; a vitória seta a flag do vigia e
 * volta (`navigate(-1)`) para a cena, que a partir daí libera a passagem.
 */
export const GUARD_BATTLE_ROUTES = {
  JOAO: "/battle/vigiaJoao",
  JOAQUIM: "/battle/vigiaJoaquim",
  LANDO: "/battle/vigiaLando",
};

export const PROFESSOR_ROOM_ROUTES = {
  ONE: "/professorRoom/one",
  TWO: "/professorRoom/two",
};

export const BRODICLASS_ROUTES = {
  ONE: "/brodiclass/one",
};

export const DIRECTOR_ROUTES = {
  ONE: "/director/one",
  TWO: "/director/two",
};

export const FOOTBALLCOURT_ROUTES = {
  ONE: "/footballcourt/one",
  TWO: "/footballcourt/two",
};

export const LIBRARY_ROUTES = {
  ONE: "/library/one",
  TWO: "/library/two",
  THREE: "/library/secret-passage",
};

export const CAFETERIA_ROUTES = {
  ONE: "/cafeteria/one",
  TWO: "/cafeteria/two",
  THREE: "/cafeteria/three",
  FOUR: "/cafeteria/four",
};

export const HELLROOM_ROUTES = {
  ONE: "/hellroom/one",
  TWO: "/hellroom/two",
  THREE: "/hellroom/three",
  FOUR: "/hellroom/four",
};
