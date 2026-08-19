import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { openStore } from "$lib/server/learn/store";
import { codeFrom } from "$lib/server/learn/credentials";

// The signed form of one credential, for whoever wants to keep it or check it
// somewhere else.
//
// The page beside this one answers the same question in words. This answers it
// in the form a verifier reads: a token naming the key that signed it and the
// position in the status list that says whether it still stands. A credential
// issued before this deployment had a signing key has no token, and saying so
// with a 404 is better than serving something that cannot be checked.
export const GET: RequestHandler = async ({ params, platform, setHeaders }) => {
  const code = codeFrom(params.code ?? "");
  if (!code) error(404, "No credential has that code.");

  const entry = await openStore(platform).readCredential(code);
  if (!entry) error(404, "No credential has that code.");
  if (!entry.token)
    error(404, "This credential was issued without a signature. Its code is the proof.");

  setHeaders({
    "content-type": "application/jwt",
    "cache-control": "public, max-age=300",
  });
  return new Response(entry.token);
};

export const prerender = false;
