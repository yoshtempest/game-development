import { rickPrimePodcastOne } from "./oneToTen/one";
import { rickPrimePodcastTwo } from "./oneToTen/two";
import { rickPrimePodcastThree } from "./oneToTen/three";
import { rickPrimePodcastFour } from "./oneToTen/four";
import { rickPrimePodcastFive } from "./oneToTen/five";
import { rickPrimePodcastSix } from "./oneToTen/six";
import { rickPrimePodcastSeven } from "./oneToTen/seven";
import { rickPrimePodcastEight } from "./oneToTen/eight";
import { rickPrimePodcastNine } from "./oneToTen/nine";
import { rickPrimePodcastTen } from "./oneToTen/ten";
import { rickPrimePodcastEleven } from "./elevenToTwenty/eleven";
import { rickPrimePodcastTwelve } from "./elevenToTwenty/twelve";
import { rickPrimePodcastThirteen } from "./elevenToTwenty/thirteen";
import { rickPrimePodcastFourteen } from "./elevenToTwenty/fourteen";
import { rickPrimePodcastFifteen } from "./elevenToTwenty/fifteen";
import { rickPrimePodcastSixteen } from "./elevenToTwenty/sixteen";
import { rickPrimePodcastSeventeen } from "./elevenToTwenty/seventeen";
import { rickPrimePodcastEighteen } from "./elevenToTwenty/eighteen";
import { rickPrimePodcastNineteen } from "./elevenToTwenty/nineteen";
import { rickPrimePodcastTwenty } from "./elevenToTwenty/twenty";
import { rickPrimePodcastTwentyOne } from "./twentyOneToThirty/twentyOne";
import { rickPrimePodcastTwentyTwo } from "./twentyOneToThirty/twentyTwo";
import { rickPrimePodcastTwentyThree } from "./twentyOneToThirty/twentyThree";
import { rickPrimePodcastTwentyFour } from "./twentyOneToThirty/twentyFour";
import { rickPrimePodcastTwentyFive } from "./twentyOneToThirty/twentyFive";
import { rickPrimePodcastTwentySix } from "./twentyOneToThirty/twentySix";
import { rickPrimePodcastTwentySeven } from "./twentyOneToThirty/twentySeven";
import { rickPrimePodcastTwentyEight } from "./twentyOneToThirty/twentyEight";
import { rickPrimePodcastTwentyNine } from "./twentyOneToThirty/twentyNine";
import { rickPrimePodcastThirty } from "./twentyOneToThirty/thirty";
import { rickPrimePodcastThirtyOne } from "./thirtyOneToFourty/thirtyOne";
import { rickPrimePodcastThirtyTwo } from "./thirtyOneToFourty/thirtyTwo";
import { rickPrimePodcastThirtyThree } from "./thirtyOneToFourty/thirtyThree";
import { rickPrimePodcastThirtyFour } from "./thirtyOneToFourty/thirtyFour";
import { rickPrimePodcastThirtyFive } from "./thirtyOneToFourty/thirtyFive";
import { rickPrimePodcastThirtySix } from "./thirtyOneToFourty/thirtySix";
import { rickPrimePodcastThirtySeven } from "./thirtyOneToFourty/thirtySeven";
import { rickPrimePodcastThirtyEight } from "./thirtyOneToFourty/thirtyEight";
import { rickPrimePodcastThirtyNine } from "./thirtyOneToFourty/thirtyNine";
import { rickPrimePodcastFourty } from "./thirtyOneToFourty/fourty";
import { rickPrimePodcastFourtyOne } from "./fourtyOneToFifty/fourtyOne";
import { rickPrimePodcastFourtyTwo } from "./fourtyOneToFifty/fourtyTwo";
import { rickPrimePodcastFourtyThree } from "./fourtyOneToFifty/fourtyThree";
import { rickPrimePodcastFourtyFour } from "./fourtyOneToFifty/fourtyFour";
import { rickPrimePodcastFourtyFive } from "./fourtyOneToFifty/fourtyFive";
import { rickPrimePodcastFourtySix } from "./fourtyOneToFifty/fourtySix";
import { rickPrimePodcastFourtySeven } from "./fourtyOneToFifty/fourtySeven";
import { rickPrimePodcastFourtyEight } from "./fourtyOneToFifty/fourtyEight";
import { rickPrimePodcastFourtyNine } from "./fourtyOneToFifty/fourtyNine";
import { rickPrimePodcastFifty } from "./fourtyOneToFifty/fifty";

/**
 * Episódio do "podcast" do Rick Prime: uma fala que ele solta ao ser
 * encontrado na exploração.
 *
 * `id` é o número do episódio (o nome do arquivo) e é o que fica salvo no
 * progresso de encontros — por isso é estável: reordenar o array não pode
 * fazer o jogador ouvir de novo uma fala que já ouviu.
 */
export type RickPrimePodcastEpisode = {
  id: number;
  dialogue: Dialogue[];
};

export const RICK_PRIME_PODCAST: readonly RickPrimePodcastEpisode[] = [
  { id: 1, dialogue: rickPrimePodcastOne },
  { id: 2, dialogue: rickPrimePodcastTwo },
  { id: 3, dialogue: rickPrimePodcastThree },
  { id: 4, dialogue: rickPrimePodcastFour },
  { id: 5, dialogue: rickPrimePodcastFive },
  { id: 6, dialogue: rickPrimePodcastSix },
  { id: 7, dialogue: rickPrimePodcastSeven },
  { id: 8, dialogue: rickPrimePodcastEight },
  { id: 9, dialogue: rickPrimePodcastNine },
  { id: 10, dialogue: rickPrimePodcastTen },
  { id: 11, dialogue: rickPrimePodcastEleven },
  { id: 12, dialogue: rickPrimePodcastTwelve },
  { id: 13, dialogue: rickPrimePodcastThirteen },
  { id: 14, dialogue: rickPrimePodcastFourteen },
  { id: 15, dialogue: rickPrimePodcastFifteen },
  { id: 16, dialogue: rickPrimePodcastSixteen },
  { id: 17, dialogue: rickPrimePodcastSeventeen },
  { id: 18, dialogue: rickPrimePodcastEighteen },
  { id: 19, dialogue: rickPrimePodcastNineteen },
  { id: 20, dialogue: rickPrimePodcastTwenty },
  { id: 21, dialogue: rickPrimePodcastTwentyOne },
  { id: 22, dialogue: rickPrimePodcastTwentyTwo },
  { id: 23, dialogue: rickPrimePodcastTwentyThree },
  { id: 24, dialogue: rickPrimePodcastTwentyFour },
  { id: 25, dialogue: rickPrimePodcastTwentyFive },
  { id: 26, dialogue: rickPrimePodcastTwentySix },
  { id: 27, dialogue: rickPrimePodcastTwentySeven },
  { id: 28, dialogue: rickPrimePodcastTwentyEight },
  { id: 29, dialogue: rickPrimePodcastTwentyNine },
  { id: 30, dialogue: rickPrimePodcastThirty },
  { id: 31, dialogue: rickPrimePodcastThirtyOne },
  { id: 32, dialogue: rickPrimePodcastThirtyTwo },
  { id: 33, dialogue: rickPrimePodcastThirtyThree },
  { id: 34, dialogue: rickPrimePodcastThirtyFour },
  { id: 35, dialogue: rickPrimePodcastThirtyFive },
  { id: 36, dialogue: rickPrimePodcastThirtySix },
  { id: 37, dialogue: rickPrimePodcastThirtySeven },
  { id: 38, dialogue: rickPrimePodcastThirtyEight },
  { id: 39, dialogue: rickPrimePodcastThirtyNine },
  { id: 40, dialogue: rickPrimePodcastFourty },
  { id: 41, dialogue: rickPrimePodcastFourtyOne },
  { id: 42, dialogue: rickPrimePodcastFourtyTwo },
  { id: 43, dialogue: rickPrimePodcastFourtyThree },
  { id: 44, dialogue: rickPrimePodcastFourtyFour },
  { id: 45, dialogue: rickPrimePodcastFourtyFive },
  { id: 46, dialogue: rickPrimePodcastFourtySix },
  { id: 47, dialogue: rickPrimePodcastFourtySeven },
  { id: 48, dialogue: rickPrimePodcastFourtyEight },
  { id: 49, dialogue: rickPrimePodcastFourtyNine },
  { id: 50, dialogue: rickPrimePodcastFifty },
];
