// Issuing is the only way a credential comes into existence. The exam pages
// call issue() when a result is final; nothing else in the site writes to the
// credentials table.

import type { Account, Credential, Store } from "./store";

// Crockford's alphabet: no I, L, O or U, so a code read aloud or copied off a
// screen lands on the right record.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

// cpak changes, and so does what a good package looks like. Two years is long
// enough for a result to be worth holding and short enough that "current"
// still means something.
const MONTHS = 24;

export function newCode() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const letters = [...bytes].map((byte) => ALPHABET[byte % ALPHABET.length]);
  return [0, 4, 8, 12]
    .map((start) => letters.slice(start, start + 4).join(""))
    .join("-");
}

export function normaliseCode(given: string) {
  const bare = given.toUpperCase().replace(/[^0-9A-Z]/g, "");
  if (bare.length !== 16) return null;
  return [0, 4, 8, 12].map((start) => bare.slice(start, start + 4)).join("-");
}

// What somebody pastes into the verification field is either the code they
// were read out or the whole address they were sent. Both end in the same
// sixteen characters, so a failed read of the lot is retried on the last
// segment of it.
export function codeFrom(given: string) {
  const whole = normaliseCode(given);
  if (whole) return whole;
  const last = given.trim().split(/[/?#]/).filter(Boolean).pop();
  return last ? normaliseCode(last) : null;
}

function plusMonths(from: Date, months: number) {
  const later = new Date(from);
  later.setUTCMonth(later.getUTCMonth() + months);
  return later.toISOString();
}

export type Result = { exam: string; title: string; result: string };

// Issuing the same exam again supersedes the previous result rather than
// editing it. Both records stay readable at their own address.
export async function issue(
  store: Store,
  account: Account,
  sat: Result,
): Promise<Credential> {
  const held = await store.readCredentials(account.key);
  const now = new Date();
  const entry: Credential = {
    code: newCode(),
    account: account.key,
    provider: account.provider,
    handle: account.handle,
    exam: sat.exam,
    title: sat.title,
    result: sat.result,
    issuedAt: now.toISOString(),
    expiresAt: plusMonths(now, MONTHS),
    supersededBy: null,
  };
  await store.writeCredential(entry);
  for (const earlier of held) {
    if (earlier.exam === sat.exam && earlier.supersededBy === null) {
      await store.supersede(earlier.code, entry.code);
    }
  }
  return entry;
}
