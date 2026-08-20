import type { PageServerLoad } from "./$types";
import { EXAMS } from "$lib/server/learn/exams";

export const load: PageServerLoad = async () => ({
  exams: Object.values(EXAMS).map((exam) => ({
    id: exam.id,
    title: exam.title,
    questions: exam.questions.length,
    pass: exam.pass,
    course: exam.course,
  })),
});
