import { readLocal } from "./progress";

export type LessonKind = "lesson" | "test";

export type Lesson = {
  slug: string;
  title: string;
  href: string;
  kind?: LessonKind;
};

export type Module = {
  title: string;
  lessons: Lesson[];
};

export type Course = {
  slug: string;
  title: string;
  minutes: number;
  href: string;
  modules: Module[];
};

export function lessonsOf(course: Course): Lesson[] {
  return course.modules.flatMap((module) => module.lessons);
}

export function lessonKey(course: Course, lesson: Lesson): string {
  return `${course.slug}/${lesson.slug}`;
}

export type Position = {
  number: number;
  total: number;
  previous: Lesson | null;
  next: Lesson | null;
};

export function positionOf(course: Course, slug: string): Position {
  const order = lessonsOf(course);
  const at = order.findIndex((lesson) => lesson.slug === slug);
  return {
    number: at + 1,
    total: order.length,
    previous: at > 0 ? order[at - 1] : null,
    next: at >= 0 && at < order.length - 1 ? order[at + 1] : null,
  };
}

export type LessonState = "done" | "current" | "not started";

export function completedIn(course: Course): Set<string> {
  const mine = new Set(
    lessonsOf(course).map((lesson) => lessonKey(course, lesson)),
  );
  const done = new Set<string>();
  for (const entry of readLocal()) {
    if (mine.has(entry.lesson)) done.add(entry.lesson);
  }
  return done;
}

export function progressLine(done: number, total: number): string {
  const share = total === 0 ? 0 : Math.round((done / total) * 100);
  return `${done} of ${total} ${total === 1 ? "lesson" : "lessons"} completed (${share}%)`;
}

export function shapeOf(course: Course) {
  const all = lessonsOf(course);
  const quizzes = all.filter((entry) => entry.kind === "test").length;
  return { lessons: all.length - quizzes, quizzes, minutes: course.minutes };
}
