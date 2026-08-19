// The course for whoever looks after the machines other people install on.
//
// It opens on what an administrator can decide and why the runtime lets them,
// rather than on the ceiling, because the ceiling only makes sense once you
// know that installations here are per-user and rootless: the machine owner
// does not own the installations, so they need one place to say what this host
// permits at all.

import type { Course } from "$lib/learn/course";

export const COURSE: Course = {
  slug: "administration",
  title: "Running cpak on machines you look after",
  href: "/learn/administration",
  modules: [
    {
      title: "What you decide",
      lessons: [
        {
          slug: "what-you-decide",
          title: "Two decisions, and neither is an install",
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
      title: "Check what you know",
      lessons: [
        {
          slug: "check-what-you-know",
          title: "Four questions",
          href: "/learn/administration/check-what-you-know",
          kind: "test",
        },
      ],
    },
  ],
};
