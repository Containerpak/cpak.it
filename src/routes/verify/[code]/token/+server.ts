import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { openStore } from "$lib/server/learn/store";
import { codeFrom } from "$lib/server/learn/credentials";

export const GET: RequestHandler = async ({ params, platform, setHeaders }) => {
  const code = codeFrom(params.code ?? "");
  if (!code) error(404, "No credential has that code.");

  const entry = await openStore(platform).readCredential(code);
  if (!entry) error(404, "No credential has that code.");
  if (!entry.token) error(404, "This credential does not have a signed token.");

  setHeaders({
    "content-type": "application/jwt",
    "cache-control": "public, max-age=300",
  });
  return new Response(entry.token);
};

export const prerender = false;
