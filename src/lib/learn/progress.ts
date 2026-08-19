// Marking a lesson done.
//
// It is always written to this browser first, so the courses work with no
// account at all. When there is a session the same entry is posted to the
// account, and that copy is what a second machine sees. The browser copy is
// kept as a mirror rather than thrown away, so signing out does not empty the
// page you were reading.
//
// A lesson page calls markDone() with its own title and the size of its course.
// Those travel with the entry so the account page can still name a lesson
// after the lesson has been renamed or removed.

export type Done = {
  lesson: string;
  title: string;
  course: string;
  courseTitle: string;
  courseTotal: number;
  completedAt: string;
};

export type Lesson = Omit<Done, "completedAt">;

const KEY = "cpak-learn-progress";
export const ENDPOINT = "/learn/api/progress";

function browser() {
  return typeof localStorage !== "undefined";
}

export function readLocal(): Done[] {
  if (!browser()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    const held = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(held)) return [];
    return held.filter((entry): entry is Done => {
      const candidate = entry as Partial<Done>;
      return (
        typeof candidate?.lesson === "string" &&
        typeof candidate?.course === "string"
      );
    });
  } catch {
    return [];
  }
}

function writeLocal(entries: Done[]) {
  if (!browser()) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // A browser with no room for it is not a reason to fail the lesson page.
  }
}

export function isDone(lesson: string) {
  return readLocal().some((entry) => entry.lesson === lesson);
}

export async function markDone(lesson: Lesson) {
  const held = readLocal();
  const known = held.find((entry) => entry.lesson === lesson.lesson);
  const entry: Done = {
    ...lesson,
    completedAt: known?.completedAt ?? new Date().toISOString(),
  };
  writeLocal([
    ...held.filter((other) => other.lesson !== lesson.lesson),
    entry,
  ]);
  await send([entry]);
}

export function forgetLocal() {
  if (!browser()) return;
  localStorage.removeItem(KEY);
}

// Called once after signing in, so work done before the account existed is
// not stranded on one machine.
export async function pushLocal() {
  const held = readLocal();
  if (held.length === 0) return;
  await send(held);
}

async function send(entries: Done[]) {
  if (!browser()) return;
  try {
    await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ entries }),
    });
  } catch {
    // Signed out, or offline. The browser copy already holds it.
  }
}

export type Course = {
  course: string;
  title: string;
  total: number;
  entries: Done[];
};

export function byTrack(entries: Done[]): Course[] {
  const groups = new Map<string, Course>();
  for (const entry of entries) {
    const group = groups.get(entry.course) ?? {
      course: entry.course,
      title: entry.courseTitle || entry.course,
      total: 0,
      entries: [],
    };
    group.title = entry.courseTitle || group.title;
    group.total = Math.max(
      group.total,
      entry.courseTotal || 0,
      group.entries.length + 1,
    );
    group.entries.push(entry);
    groups.set(entry.course, group);
  }
  for (const group of groups.values()) {
    group.entries.sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  }
  return [...groups.values()].sort((a, b) => a.title.localeCompare(b.title));
}
