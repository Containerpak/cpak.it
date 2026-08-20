import type { Course } from "$lib/learn/course";

export const COURSE: Course = {
  slug: "administration",
  title: "Running cpak on machines you look after",
  minutes: 35,
  href: "/learn/administration",
  modules: [
    {
      title: "What you decide",
      lessons: [
        {
          slug: "what-you-decide",
          title: "What you decide, and what you do not",
          href: "/learn/administration/what-you-decide",
        },
      ],
    },
    {
      title: "Setting the policy",
      lessons: [
        {
          slug: "writing-a-ceiling",
          title: "Writing a ceiling",
          href: "/learn/administration/writing-a-ceiling",
        },
      ],
    },
    {
      title: "Who you install from",
      lessons: [
        {
          slug: "requiring-a-signature",
          title: "Requiring a signature",
          href: "/learn/administration/requiring-a-signature",
        },
      ],
    },
    {
      title: "When something is refused",
      lessons: [
        {
          slug: "reading-a-refusal",
          title: "Reading a refusal",
          href: "/learn/administration/reading-a-refusal",
        },
      ],
    },
    {
      title: "Check what you know",
      lessons: [
        {
          slug: "check-what-you-know",
          title: "Eight questions",
          href: "/learn/administration/check-what-you-know",
          kind: "test",
        },
      ],
    },
  ],
};
