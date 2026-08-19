// The shape of a course, and the arithmetic every course page needs.
//
// A course is two levels deep and never one: named modules, and lessons under
// them. The module names are what a reader scans to decide whether the course
// is about the thing they came for, so a flat list of ten titles is not a
// shorter version of this, it is a worse one.
//
// The last module of a course that ends in an exam holds the test. A test is
// a lesson as far as this file is concerned: it has a place in the order, it
// has a state, and the rail carries it like any other, because somebody who
// does not pass has to walk back into a lesson and come out again without
// leaving the course.

import { readLocal } from "./progress";

export type LessonKind = "lesson" | "test";

export type Lesson = {
  /** Unique inside its course. It is what progress is recorded against. */
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
  /** The course progress is recorded against. */
  slug: string;
  title: string;
  /** The overview. The rail links back to it from every lesson. */
  href: string;
  modules: Module[];
};

/** Every lesson of the course in reading order, modules flattened away. */
export function lessonsOf(course: Course): Lesson[] {
  return course.modules.flatMap((module) => module.lessons);
}

/** What progress calls this lesson. Scoped by course, so two courses may use
 *  the same slug without one marking the other done. */
export function lessonKey(course: Course, lesson: Lesson): string {
  return `${course.slug}/${lesson.slug}`;
}

export type Position = {
  /** One-based, for saying it out loud. */
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

/** The lessons of this course this browser has been marked through. */
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

/** "3 of 10 lessons completed (30%)", said the same way everywhere. */
export function progressLine(done: number, total: number): string {
  const share = total === 0 ? 0 : Math.round((done / total) * 100);
  return `${done} of ${total} ${total === 1 ? "lesson" : "lessons"} completed (${share}%)`;
}
