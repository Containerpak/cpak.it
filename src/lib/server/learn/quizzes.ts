import type { QuizQuestion } from "$lib/learn/quiz";
import { QUESTIONS as administration } from "./quizzes/administration";
import { QUESTIONS as engineering } from "./quizzes/engineering";
import { QUESTIONS as packaging } from "./quizzes/packaging";
import { QUESTIONS as start } from "./quizzes/start";

export const QUIZZES: Record<string, QuizQuestion[]> = {
  administration,
  engineering,
  packaging,
  start,
};
