import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { whoIsHere } from "$lib/server/learn/session";
import type { Completion } from "$lib/server/learn/store";

const LIMIT = 200;

function clean(value: unknown, length: number) {
  return typeof value === "string" ? value.trim().slice(0, length) : "";
}

function read(value: unknown): Completion | null {
  const given = value as Partial<Completion>;
  const lesson = clean(given?.lesson, 120);
  const course = clean(given?.course, 120);
  if (!lesson || !course) return null;
  const at = clean(given?.completedAt, 40);
  const total = Number(given?.courseTotal);
  return {
    lesson,
    title: clean(given?.title, 200) || lesson,
    course,
    courseTitle: clean(given?.courseTitle, 200) || course,
    courseTotal:
      Number.isFinite(total) && total > 0
        ? Math.min(Math.trunc(total), 500)
        : 0,
    completedAt: Number.isNaN(Date.parse(at)) ? new Date().toISOString() : at,
  };
}

export const POST: RequestHandler = async (event) => {
  const { store, account } = await whoIsHere(event);
  if (!account) return json({ kept: 0, reason: "signed out" }, { status: 401 });

  let body: unknown;
  try {
    body = await event.request.json();
  } catch {
    return json({ kept: 0, reason: "not json" }, { status: 400 });
  }

  const given = (body as { entries?: unknown })?.entries;
  if (!Array.isArray(given))
    return json({ kept: 0, reason: "no entries" }, { status: 400 });

  const entries = given
    .slice(0, LIMIT)
    .map(read)
    .filter((entry): entry is Completion => entry !== null);
  for (const entry of entries) await store.recordCompletion(account.key, entry);

  return json({ kept: entries.length });
};
