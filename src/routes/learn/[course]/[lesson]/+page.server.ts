import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { renderMarkdown } from "$lib/markdown";
import { findLesson } from "$lib/server/learn/catalog";
import { QUIZZES } from "$lib/server/learn/quizzes";
import { getLocale } from "$lib/paraglide/runtime.js";
import { localizeLearn } from "$lib/server/learn/localize";

export const load: PageServerLoad = async ({ params }) => {
  const locale = getLocale();
  const entry = findLesson(params.course, params.lesson, locale);
  if (!entry) error(404, "There is no lesson by that name.");
  return {
    ...entry,
    body: renderMarkdown(entry.markdown),
    quiz: entry.quiz
      ? localizeLearn(QUIZZES[entry.quiz] ?? null, locale)
      : null,
  };
};
