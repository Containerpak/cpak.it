import type { Course } from "$lib/learn/course";

export const COURSE: Course = {
  slug: "engineering",
  title: "Engineering cpak integrations",
  minutes: 110,
  href: "/learn/engineering",
  modules: [
    {
      title: "Follow the runtime",
      lessons: [
        {
          slug: "following-a-launch",
          title: "Follow one launch",
          href: "/learn/engineering/following-a-launch",
        },
        {
          slug: "sandbox-boundaries",
          title: "Build the sandbox in layers",
          href: "/learn/engineering/sandbox-boundaries",
        },
      ],
    },
    {
      title: "Cross the host boundary",
      lessons: [
        {
          slug: "typed-host-actions",
          title: "Design a typed host action",
          href: "/learn/engineering/typed-host-actions",
        },
        {
          slug: "sessions-and-nested-runs",
          title: "Cross boundaries without losing identity",
          href: "/learn/engineering/sessions-and-nested-runs",
        },
      ],
    },
    {
      title: "Extend storage and delivery",
      lessons: [
        {
          slug: "writing-a-storage-driver",
          title: "Implement a storage driver",
          href: "/learn/engineering/writing-a-storage-driver",
        },
        {
          slug: "runtime-sources",
          title: "Fetch a vendor payload safely",
          href: "/learn/engineering/runtime-sources",
        },
        {
          slug: "integrity-and-recovery",
          title: "Keep updates and launches verifiable",
          href: "/learn/engineering/integrity-and-recovery",
        },
      ],
    },
    {
      title: "Compose optional capabilities",
      lessons: [
        {
          slug: "addons-and-provider-slots",
          title: "Model addons with provider slots",
          href: "/learn/engineering/addons-and-provider-slots",
        },
      ],
    },
    {
      title: "Check what you know",
      lessons: [
        {
          slug: "check-what-you-know",
          title: "Ten questions",
          href: "/learn/engineering/check-what-you-know",
          kind: "test",
        },
      ],
    },
  ],
};
