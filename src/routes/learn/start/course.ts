import type { Course } from "$lib/learn/course";

export const COURSE: Course = {
  slug: "start",
  title: "Start here",
  minutes: 25,
  href: "/learn/start",
  modules: [
    {
      title: "What cpak is",
      lessons: [
        {
          slug: "what-cpak-is",
          title: "An application that starts with nothing",
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
    {
      title: "Check what you know",
      lessons: [
        {
          slug: "check-what-you-know",
          title: "Six questions",
          href: "/learn/start/check-what-you-know",
          kind: "test",
        },
      ],
    },
  ],
};
