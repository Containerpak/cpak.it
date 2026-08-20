export type QuizChoice = {
  text: string;
  correct?: boolean;
  why: string;
};

export type QuizQuestion = {
  asks: string;
  choices: QuizChoice[];
};
