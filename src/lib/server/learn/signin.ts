import { env } from "$env/dynamic/private";
import { dev } from "$app/environment";
import type { Cookies } from "@sveltejs/kit";
import { SITE_URL } from "$lib/store";
import type { Account, Provider } from "./store";
import { randomToken } from "./session";

const STATE_COOKIE = "cpak_learn_signin";
const RETURN_COOKIE = "cpak_learn_return";
const AUTHORIZE = "https://github.com/login/oauth/authorize";
const TOKEN = "https://github.com/login/oauth/access_token";
const USER = "https://api.github.com/user";

export type Door = { provider: Provider; label: string };

function secrets() {
  const id = env.GITHUB_CLIENT_ID ?? "";
  const secret = env.GITHUB_CLIENT_SECRET ?? "";
  return id && secret ? { id, secret } : null;
}

export function githubReady() {
  return secrets() !== null;
}

export function localSigninOffered() {
  return dev && !githubReady();
}

function callbackOrigin(requestOrigin: string) {
  return dev ? requestOrigin : SITE_URL;
}

export function examReturn(value: string | null) {
  return value && /^\/learn\/exams\/[a-z0-9-]+$/.test(value) ? value : null;
}

export function beginGithub(
  cookies: Cookies,
  origin: string,
  returnTo: string | null = null,
) {
  const keys = secrets();
  if (!keys) return null;

  const state = randomToken(16);
  cookies.set(STATE_COOKIE, state, {
    path: "/learn/account",
    httpOnly: true,
    sameSite: "lax",
    secure: !dev,
    maxAge: 600,
  });
  cookies.set(
    RETURN_COOKIE,
    examReturn(returnTo) ?? "/learn/account?welcome=1",
    {
      path: "/learn/account",
      httpOnly: true,
      sameSite: "lax",
      secure: !dev,
      maxAge: 600,
    },
  );

  const url = new URL(AUTHORIZE);
  url.searchParams.set("client_id", keys.id);
  url.searchParams.set(
    "redirect_uri",
    `${callbackOrigin(origin)}/learn/account/auth/github/callback`,
  );
  url.searchParams.set("scope", "read:user");
  url.searchParams.set("state", state);
  url.searchParams.set("allow_signup", "false");
  return url.toString();
}

export function takeReturn(cookies: Cookies) {
  const target = cookies.get(RETURN_COOKIE) ?? "";
  cookies.delete(RETURN_COOKIE, { path: "/learn/account" });
  return examReturn(target) ?? "/learn/account?welcome=1";
}

export function matchState(cookies: Cookies, given: string | null) {
  const held = cookies.get(STATE_COOKIE);
  cookies.delete(STATE_COOKIE, { path: "/learn/account" });
  return Boolean(held) && held === given;
}

export async function finishGithub(
  code: string,
  origin: string,
): Promise<Account> {
  const keys = secrets();
  if (!keys)
    throw new Error("GitHub sign-in is not configured on this deployment.");

  const exchange = await fetch(TOKEN, {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({
      client_id: keys.id,
      client_secret: keys.secret,
      code,
      redirect_uri: `${callbackOrigin(origin)}/learn/account/auth/github/callback`,
    }),
  });
  if (!exchange.ok) throw new Error("GitHub did not answer the token request.");

  const granted = (await exchange.json()) as {
    access_token?: string;
    error_description?: string;
  };
  if (!granted.access_token) {
    throw new Error(granted.error_description ?? "GitHub refused the sign-in.");
  }

  const profile = await fetch(USER, {
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${granted.access_token}`,
      "user-agent": "cpak.it",
    },
  });
  if (!profile.ok)
    throw new Error("GitHub would not say which account this is.");

  const person = (await profile.json()) as {
    id?: number;
    login?: string;
    avatar_url?: string;
  };
  if (!person.id || !person.login)
    throw new Error("GitHub returned an account with no handle.");

  const now = new Date().toISOString();
  return {
    key: `github:${person.id}`,
    provider: "github",
    handle: person.login,
    avatar: person.avatar_url ?? "",
    createdAt: now,
    seenAt: now,
  };
}

export function localAccount(handle: string): Account {
  const trimmed = handle
    .trim()
    .replace(/[^A-Za-z0-9-]/g, "")
    .slice(0, 39);
  if (!trimmed) throw new Error("Type a handle to sign in with.");
  const now = new Date().toISOString();
  return {
    key: `local:${trimmed.toLowerCase()}`,
    provider: "local",
    handle: trimmed,
    avatar: "",
    createdAt: now,
    seenAt: now,
  };
}
