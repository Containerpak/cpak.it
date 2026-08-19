// The credential as its holder sees it: the same record as the public page,
// plus the things only the holder needs, such as the link to hand out.

import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { whoIsHere } from "$lib/server/learn/session";
import { normaliseCode } from "$lib/server/learn/credentials";
import { verifyPath } from "$lib/learn/credential";

export const load: PageServerLoad = async (event) => {
  const code = normaliseCode(event.params.code);
  if (!code) error(404, "That is not a credential code.");

  const { store, account } = await whoIsHere(event);
  const entry = await store.readCredential(code);
  if (!entry) error(404, "No credential has that code.");

  // Anyone may read a credential; only its holder reads it from here.
  if (!account || account.key !== entry.account)
    redirect(303, verifyPath(code));

  const successor = entry.supersededBy
    ? await store.readCredential(entry.supersededBy)
    : null;

  return {
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
