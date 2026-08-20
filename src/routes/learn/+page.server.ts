import type { PageServerLoad } from "./$types";
import { EXAMS } from "$lib/server/learn/exams";
import { COURSES } from "$lib/server/learn/catalog";
import { getLocale } from "$lib/paraglide/runtime.js";
import { localizeLearn } from "$lib/server/learn/localize";
import { PLAYGROUNDS } from "$lib/learn/playgrounds";

export const load: PageServerLoad = async () => {
  const locale = getLocale();
  return {
    courses: COURSES.map((entry) =>
      localizeLearn(
        {
          course: entry.course,
          ...entry.card,
        },
        locale,
      ),
    ),
    exams: Object.values(EXAMS).map((exam) =>
      localizeLearn(
        {
          id: exam.id,
          title: exam.title,
          questions: exam.questions.length,
          pass: exam.pass,
          course: exam.course,
        },
        locale,
      ),
    ),
    playgrounds: localizeLearn(PLAYGROUNDS, locale),
  };
};
