import { dev } from "$app/environment";
import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { endSession, startSession, whoIsHere } from "$lib/server/learn/session";
import {
  githubReady,
  localAccount,
  localSigninOffered,
} from "$lib/server/learn/signin";

export const load: PageServerLoad = async (event) => {
  const { store, account } = await whoIsHere(event);

  const doors = {
    github: githubReady(),
    local: localSigninOffered(),
    durable: store.durable,
  };

  if (!account)
    return { ...doors, account: null, completed: [], credentials: [] };

  const [completed, credentials] = await Promise.all([
    store.readCompletions(account.key),
    store.readCredentials(account.key),
  ]);

  return {
    ...doors,
    account: {
      provider: account.provider,
      handle: account.handle,
      avatar: account.avatar,
      createdAt: account.createdAt,
    },
    completed: completed.map((entry) => ({
      lesson: entry.lesson,
      title: entry.title,
      course: entry.course,
      courseTitle: entry.courseTitle,
      courseTotal: entry.courseTotal,
      completedAt: entry.completedAt,
    })),
    credentials: credentials.map((entry) => ({
      code: entry.code,
      provider: entry.provider,
      handle: entry.handle,
      exam: entry.exam,
      title: entry.title,
      result: entry.result,
      issuedAt: entry.issuedAt,
      expiresAt: entry.expiresAt,
      supersededBy: entry.supersededBy,
      signed: entry.token !== "",
    })),
  };
};

export const actions: Actions = {
  local: async (event) => {
    if (!localSigninOffered())
      error(404, "Local sign-in is not available here.");
    const form = await event.request.formData();
    const handle = String(form.get("handle") ?? "");
    const { store } = await whoIsHere(event);
    try {
      await startSession(store, event.cookies, localAccount(handle));
    } catch (reason) {
      return fail(400, {
        problem:
          reason instanceof Error
            ? reason.message
            : "That handle was not usable.",
      });
    }
    redirect(303, "/learn/account?welcome=1");
  },

  signout: async (event) => {
    const { store } = await whoIsHere(event);
    await endSession(store, event.cookies);
    redirect(303, "/learn/account");
  },

  // Everything the account holds, except the credentials, which are public
  // records at their own addresses and are not the account's to unwrite.
  erase: async (event) => {
    const { store, account } = await whoIsHere(event);
    if (!account)
      return fail(401, { problem: "There is no session to delete." });

    const kept = await store.readCredentials(account.key);
    const gone = await store.erase(account.key);
    event.cookies.delete("cpak_learn_session", { path: "/" });

    return {
      erased: {
        completions: gone.completions,
        sessions: gone.sessions,
        account: gone.accounts,
        credentials: kept.length,
        durable: store.durable,
      },
    };
  },

  // Development only. The exam pages are not built yet, and without a real
  // credential row there is no way to look at the pages that show one.
};
