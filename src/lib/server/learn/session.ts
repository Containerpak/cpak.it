// Sessions for the Learn account. A session is a random token in a cookie and
// a row in the store; the row holds the SHA-256 of the token rather than the
// token itself, so a copy of the database is not a set of live logins.

import type { Cookies, RequestEvent } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { openStore, type Account, type Store } from "./store";

export const COOKIE = "cpak_learn_session";

// Long enough that a packager is not signed out between two evenings of work,
// short enough that an abandoned laptop stops being an account.
const LIFETIME_DAYS = 30;

function random(bytes: number) {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return [...buffer].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function fingerprint(token: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function expiry(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export async function startSession(
  store: Store,
  cookies: Cookies,
  account: Account,
) {
  const token = random(32);
  const expiresAt = expiry(LIFETIME_DAYS);
  await store.saveAccount(account);
  await store.openSession(await fingerprint(token), account.key, expiresAt);
  cookies.set(COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: !dev,
    expires: new Date(expiresAt),
  });
}

// Ends the session on the server first, then drops the cookie. Presenting the
// old token again finds nothing.
export async function endSession(store: Store, cookies: Cookies) {
  const token = cookies.get(COOKIE);
  if (token) await store.closeSession(await fingerprint(token));
  cookies.delete(COOKIE, { path: "/" });
}

export type Here = Pick<RequestEvent, "platform" | "cookies">;
export type Signed = { store: Store; account: Account | null };

export async function whoIsHere(event: Here): Promise<Signed> {
  const store = openStore(event.platform);
  const token = event.cookies.get(COOKIE);
  if (!token) return { store, account: null };

  const held = await fingerprint(token);
  const session = await store.readSession(held);
  if (!session) {
    event.cookies.delete(COOKIE, { path: "/" });
    return { store, account: null };
  }
  if (Date.parse(session.expiresAt) <= Date.now()) {
    await store.closeSession(held);
    event.cookies.delete(COOKIE, { path: "/" });
    return { store, account: null };
  }

  const account = await store.readAccount(session.account);
  if (!account) {
    // The account was deleted while this cookie was still in a browser.
    await store.closeSession(held);
    event.cookies.delete(COOKIE, { path: "/" });
    return { store, account: null };
  }
  return { store, account };
}

export { random as randomToken };
