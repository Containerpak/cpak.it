import type { PageServerLoad } from "./$types";
import { EXAMS } from "$lib/server/learn/exams";
import { whoIsHere } from "$lib/server/learn/session";

export const load: PageServerLoad = async (event) => {
  const { account } = await whoIsHere(event);
  return {
    signedIn: Boolean(account),
    exams: Object.values(EXAMS).map((exam) => ({
      id: exam.id,
      title: exam.title,
      course: exam.course,
      questions: exam.questions.length,
      pass: exam.pass,
    })),
  };
};
