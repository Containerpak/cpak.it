// A short course, two lessons long, kept beside the shell every lesson uses.
//
// It is here so the layout can be looked at with real writing in it rather
// than filler: one lesson with a board beside the text, one lesson that needs
// no board and takes the width instead.

import type { Course } from "$lib/learn/course";

export const COURSE: Course = {
  slug: "example",
  title: "Two lessons on cpak permissions",
  href: "/learn/example",
  chapters: [
    {
      title: "What a permission is",
      lessons: [
        {
          slug: "nothing-is-granted",
          title: "Nothing is granted unless the manifest asks",
          href: "/learn/example/nothing-is-granted",
        },
        {
          slug: "a-ceiling-never-grants",
          title: "A ceiling narrows, and never grants",
          href: "/learn/example/a-ceiling-never-grants",
        },
      ],
    },
  ],
};
