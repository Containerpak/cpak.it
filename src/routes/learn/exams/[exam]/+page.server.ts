import { error, fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { whoIsHere } from "$lib/server/learn/session";
import { EXAMS, asked, mark } from "$lib/server/learn/exams";
import { issue } from "$lib/server/learn/credentials";

export const load: PageServerLoad = async (event) => {
  const exam = EXAMS[event.params.exam];
  if (!exam) error(404, "There is no exam by that name.");

  const { account } = await whoIsHere(event);
  return {
    exam: asked(exam),
    signedIn: Boolean(account),
    handle: account?.handle ?? "",
  };
};

export const actions: Actions = {
  sit: async (event) => {
    const exam = EXAMS[event.params.exam];
    if (!exam) error(404, "There is no exam by that name.");

    const { store, account } = await whoIsHere(event);
    if (!account) {
      return fail(401, {
        problem: "Sign in before sitting this. A credential names an account.",
      });
    }

    const form = await event.request.formData();
    const given = exam.questions.map((_, index) => {
      const value = form.get(`q${index}`);
      const chosen = typeof value === "string" ? Number(value) : Number.NaN;
      return Number.isInteger(chosen) ? chosen : null;
    });

    if (given.some((answer) => answer === null)) {
      return fail(400, {
        problem: "Answer every question. An unanswered one is not a wrong one.",
        given,
      });
    }

    const result = mark(exam, given);
    if (!result.passed) {
      return fail(200, {
        marked: result,
        problem: "",
      });
    }

    const entry = await issue(store, account, {
      exam: exam.id,
      title: exam.credential,
      result: "Passed",
    });
    return { marked: result, code: entry.code };
  },
};
