// The course for somebody who is going to publish a package.
//
// It opens on what a package is rather than on writing a manifest, because the
// first thing a packager gets wrong is not the syntax: it is asking for more
// than the program needs, which happens when the manifest looks like a list of
// options rather than a list of promises.
//
// Three lessons and a test. Two of the three carry the playground the lesson is
// about, so the reader changes something and reads cpak's own answer rather
// than a description of it.

import type { Course } from "$lib/learn/course";

export const COURSE: Course = {
  slug: "packaging",
  title: "Packaging an application",
  minutes: 30,
  href: "/learn/packaging",
  modules: [
    {
      title: "What you are shipping",
      lessons: [
        {
          slug: "what-a-package-is",
          title: "An image, a manifest, and an address",
          href: "/learn/packaging/what-a-package-is",
        },
      ],
    },
    {
      title: "What to ask for",
      lessons: [
        {
          slug: "asking-for-a-directory",
          title: "Asking for a directory",
          href: "/learn/packaging/asking-for-a-directory",
        },
        {
          slug: "shipping-a-desktop-entry",
          title: "Shipping a desktop entry",
          href: "/learn/packaging/shipping-a-desktop-entry",
        },
      ],
    },
    {
      title: "Check what you know",
      lessons: [
        {
          slug: "check-what-you-know",
          title: "Five questions",
          href: "/learn/packaging/check-what-you-know",
          kind: "test",
        },
      ],
    },
  ],
};
