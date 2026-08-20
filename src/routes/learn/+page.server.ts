import type { PageServerLoad } from "./$types";
import { EXAMS } from "$lib/server/learn/exams";

// The entry page lists the exams, so it asks the same module that marks them.
// A second list of names kept here would be a second answer waiting to
// disagree with the first about how many questions an exam has.
export const load: PageServerLoad = async () => ({
  exams: Object.values(EXAMS).map((exam) => ({
    id: exam.id,
    title: exam.title,
    questions: exam.questions.length,
    pass: exam.pass,
    course: exam.course,
  })),
});
