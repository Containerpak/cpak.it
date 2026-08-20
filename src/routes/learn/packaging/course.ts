import type { Course } from "$lib/learn/course";

export const COURSE: Course = {
  slug: "packaging",
  title: "Packaging an application",
  minutes: 65,
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
        {
          slug: "building-the-image",
          title: "Build the runtime image",
          href: "/learn/packaging/building-the-image",
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
      title: "Deliver the application",
      lessons: [
        {
          slug: "runtime-source-or-image",
          title: "Choose image or runtime source",
          href: "/learn/packaging/runtime-source-or-image",
        },
        {
          slug: "dependencies-and-addons",
          title: "Choose dependencies and addons",
          href: "/learn/packaging/dependencies-and-addons",
        },
      ],
    },
    {
      title: "Publish and verify",
      lessons: [
        {
          slug: "publishing-a-release",
          title: "Publish a reproducible release",
          href: "/learn/packaging/publishing-a-release",
        },
      ],
    },
    {
      title: "Check what you know",
      lessons: [
        {
          slug: "check-what-you-know",
          title: "Eight questions",
          href: "/learn/packaging/check-what-you-know",
          kind: "test",
        },
      ],
    },
  ],
};
