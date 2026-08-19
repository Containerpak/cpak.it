// The public page for one credential. No session is read here, so what a
// stranger sees does not depend on who they are.

import type { PageServerLoad } from "./$types";
import { openStore } from "$lib/server/learn/store";
import { normaliseCode } from "$lib/server/learn/credentials";

export const load: PageServerLoad = async ({ params, platform }) => {
  const code = normaliseCode(params.code);
  if (!code) return { given: params.code, held: null, successorIssuedAt: null };

  const store = openStore(platform);
  const entry = await store.readCredential(code);
  if (!entry) return { given: code, held: null, successorIssuedAt: null };

  const successor = entry.supersededBy
    ? await store.readCredential(entry.supersededBy)
    : null;

  return {
    given: code,
    held: {
      code: entry.code,
      provider: entry.provider,
      handle: entry.handle,
      exam: entry.exam,
      title: entry.title,
      result: entry.result,
      issuedAt: entry.issuedAt,
      expiresAt: entry.expiresAt,
      supersededBy: entry.supersededBy,
    },
    successorIssuedAt: successor?.issuedAt ?? null,
  };
};
