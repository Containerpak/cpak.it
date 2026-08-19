import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { publicKeys } from "$lib/server/learn/signing";

// The keys a cpak credential is signed with.
//
// At the address every verifier already looks for one, so nobody has to be
// told where it is. A deployment with no signing key configured serves an
// empty set rather than an error: there is nothing to check, and saying so in
// the shape a verifier understands is better than a 404 it has to guess about.
export const GET: RequestHandler = async ({ setHeaders }) => {
  setHeaders({ "cache-control": "public, max-age=3600" });
  return json({ keys: await publicKeys() });
};

export const prerender = false;
