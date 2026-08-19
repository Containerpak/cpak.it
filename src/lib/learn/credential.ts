// What a credential is, in the words the project is willing to stand behind,
// and the small amount of logic both the private and the public page need.

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
};

// Read on both pages, so the private view and the public view cannot drift
// into describing the same record differently.
export const CLAIM =
  "This records the result of an online exam taken on the candidate's own machine. The exam is open book and nobody watched it being taken. The account named here is the only part of it that was authenticated, and an account is a sign-in, not a person.";

export const IMMUTABLE =
  "A credential is written once. It is never reworded and never withdrawn. Taking the exam again issues a new one and marks this one superseded, and a credential stops being current on its expiry date. Either way this page keeps showing what was earned and when.";

export function standing(entry: Held, now = new Date()): Standing {
  if (entry.supersededBy) return "superseded";
  return Date.parse(entry.expiresAt) <= now.getTime() ? "expired" : "valid";
}

// One word for a chip, a sentence for the line under it.
export const STANDING_WORD: Record<Standing, string> = {
  valid: "Current",
  superseded: "Superseded",
  expired: "Expired",
};

export const STANDING_CHIP: Record<Standing, string> = {
  valid: "border-[#3E7BFF] bg-[#3E7BFF]/10 text-[#3158c7]",
  superseded: "border-slate-200 bg-yellow-100 text-yellow-800",
  expired: "border-slate-200 bg-slate-100 text-gray-500",
};

export function standingLine(entry: Held, now = new Date()) {
  switch (standing(entry, now)) {
    case "superseded":
      return "Superseded by a later result for the same exam.";
    case "expired":
      return `Expired on ${longDate(entry.expiresAt)}.`;
    default:
      return `Current until ${longDate(entry.expiresAt)}.`;
  }
}

// Deliberately short, and deliberately outside /learn: whoever follows this
// link is checking a record, not taking a course, and the address has to
// outlive whatever the learning area is called next year.
export function verifyPath(code: string) {
  return `/verify/${code}`;
}

export function longDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function issuerLine(entry: Held) {
  return entry.provider === "github"
    ? `GitHub account @${entry.handle}`
    : `Local development account ${entry.handle}, not checked against any provider`;
}
