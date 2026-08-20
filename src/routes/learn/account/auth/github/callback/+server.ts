import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { finishGithub, matchState, takeReturn } from "$lib/server/learn/signin";
import { startSession, whoIsHere } from "$lib/server/learn/session";

function back(reason: string, returnTo: string) {
  const url = new URL("/learn/account", "https://cpak.it");
  url.searchParams.set("problem", reason);
  if (returnTo.startsWith("/learn/exams/"))
    url.searchParams.set("returnTo", returnTo);
  return `${url.pathname}${url.search}`;
}

export const GET: RequestHandler = async (event) => {
  const { cookies, url } = event;
  const returnTo = takeReturn(cookies);
  const refused =
    url.searchParams.get("error_description") ?? url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const expected = matchState(cookies, state);
  if (refused) redirect(303, back(refused, returnTo));
  if (!expected)
    redirect(
      303,
      back("That sign-in did not come back from where it started.", returnTo),
    );
  if (!code) redirect(303, back("GitHub came back without a code.", returnTo));

  let account;
  try {
    account = await finishGithub(code, url.origin);
  } catch (reason) {
    redirect(
      303,
      back(
        reason instanceof Error ? reason.message : "GitHub sign-in failed.",
        returnTo,
      ),
    );
  }

  const { store } = await whoIsHere(event);
  await startSession(store, cookies, account);
  redirect(303, returnTo);
};
