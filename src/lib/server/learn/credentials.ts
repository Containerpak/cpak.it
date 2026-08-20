import type { Account, Credential, Store } from "./store";
import { signCredential } from "./signing";

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
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

export async function issue(
  store: Store,
  account: Account,
  sat: Result,
): Promise<Credential> {
  const held = await store.readCredentials(account.key);
  const now = new Date();
  const facts = {
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
    statusIndex: await store.nextStatusIndex(),
  };
  const entry: Credential = {
    ...facts,
    token: await signCredential(facts),
  };
  await store.writeCredential(entry);
  for (const earlier of held) {
    if (earlier.exam === sat.exam && earlier.supersededBy === null) {
      await store.supersede(earlier.code, entry.code);
    }
  }
  return entry;
}
