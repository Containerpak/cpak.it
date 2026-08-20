import * as m from "$lib/paraglide/messages.js";
import { getLocale } from "$lib/paraglide/runtime.js";

export type Standing = "valid" | "superseded" | "expired";

export type Held = {
  code: string;
  provider: "github" | "local";
  handle: string;
  exam: string;
  title: string;
  result: string;
  issuedAt: string;
  expiresAt: string;
  supersededBy: string | null;
  signed?: boolean;
};

export const claim = () => m.credential_claim();

export const immutable = () => m.credential_immutable();

export function standing(entry: Held, now = new Date()): Standing {
  if (entry.supersededBy) return "superseded";
  return Date.parse(entry.expiresAt) <= now.getTime() ? "expired" : "valid";
}

export function standingWord(value: Standing) {
  if (value === "superseded") return m.credential_superseded();
  if (value === "expired") return m.credential_expired();
  return m.credential_current();
}

export const STANDING_CHIP: Record<Standing, string> = {
  valid: "border-[#3E7BFF] bg-[#3E7BFF]/10 text-[#3158c7]",
  superseded: "border-slate-200 bg-yellow-100 text-yellow-800",
  expired: "border-slate-200 bg-slate-100 text-gray-500",
};

export function standingLine(entry: Held, now = new Date()) {
  switch (standing(entry, now)) {
    case "superseded":
      return m.credential_superseded_line();
    case "expired":
      return m.credential_expired_on({ date: longDate(entry.expiresAt) });
    default:
      return m.credential_current_until({ date: longDate(entry.expiresAt) });
  }
}

export function tokenPath(code: string) {
  return `/verify/${code}/token`;
}

export function verifyPath(code: string) {
  return `/verify/${code}`;
}

export function longDate(value: string) {
  const locale = getLocale();
  return new Date(value).toLocaleDateString(
    locale === "it" ? "it-IT" : locale === "es" ? "es-ES" : "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
}

export function issuerLine(entry: Held) {
  return entry.provider === "github"
    ? m.credential_github_account({ handle: `@${entry.handle}` })
    : m.credential_local_account({ handle: entry.handle });
}
