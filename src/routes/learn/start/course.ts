// The first course. It assumes nothing: somebody arriving here may never have
// heard of cpak, and the first two lessons are written for them.
//
// The last two are the ones that were already written, moved in behind the
// orientation they were missing. They teach by pointing at a playground, which
// is why they sit after the lessons that explain what a manifest and a
// permission are.

import type { Course } from "$lib/learn/course";

export const COURSE: Course = {
  slug: "start",
  title: "Start here",
  href: "/learn/start",
  modules: [
    {
      title: "What cpak is",
      lessons: [
        {
          slug: "what-cpak-is",
          title: "What cpak is",
          href: "/learn/start/what-cpak-is",
        },
        {
          slug: "installing-something",
          title: "Installing something",
          href: "/learn/start/installing-something",
        },
      ],
    },
    {
      title: "What an application may do",
      lessons: [
        {
          slug: "nothing-is-granted",
          title: "Nothing is granted unless the manifest asks",
          href: "/learn/start/nothing-is-granted",
        },
        {
          slug: "a-ceiling-never-grants",
          title: "A ceiling narrows, and never grants",
          href: "/learn/start/a-ceiling-never-grants",
        },
      ],
    },
  ],
};
