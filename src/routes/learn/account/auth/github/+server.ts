import { error, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { beginGithub } from "$lib/server/learn/signin";

export const GET: RequestHandler = ({ cookies, url }) => {
  const target = beginGithub(
    cookies,
    url.origin,
    url.searchParams.get("returnTo"),
  );
  if (!target)
    error(503, "GitHub sign-in is not configured on this deployment.");
  redirect(302, target);
};
