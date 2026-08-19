// The way in for somebody holding a code and nothing else.
//
// There is no load here on purpose: this page reads no session, holds no
// listing and runs no search, so there is nothing for it to fetch. The field
// resolves what was pasted and sends the reader to the record.

import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { codeFrom } from "$lib/server/learn/credentials";
import { TOO_OFTEN, askedTooOften } from "$lib/server/learn/ratelimit";

export const actions: Actions = {
  default: async ({ request, getClientAddress }) => {
    if (askedTooOften(getClientAddress())) error(429, TOO_OFTEN);

    const form = await request.formData();
    const given = String(form.get("code") ?? "").trim();
    const code = codeFrom(given);

    if (!code)
      return fail(400, {
        given: given.slice(0, 120),
        problem:
          "A code is sixteen characters in four groups. Paste the code itself or the whole address it came in, and nothing else.",
      });

    redirect(303, `/verify/${code}`);
  },
};
