export const announcements = [
  {
    section: "cpak 2.11.1",
    date: "September 1, 2026",
    published: "2026-09-01",
    title: "Change networks without restarting your cpak apps",
    description:
      "cpak refreshes isolated application networking after a resolver change without sharing the host network or restarting the container.",
    href: "/announcements/change-networks-without-restarting-cpak-apps",
  },
  {
    section: "cpak 2.9.5",
    date: "August 28, 2026",
    published: "2026-08-28",
    title: "Manifest v3, with room for real desktop applications",
    description:
      "cpak 2.9.5 keeps the stricter manifest v3 boundary and gives X11 and Bluetooth applications a confined path to the host services they need.",
    href: "/announcements/why-cpak-needs-manifest-v3",
  },
  {
    section: "cpak 2.6",
    date: "August 18, 2026",
    published: "2026-08-18",
    title: "Refusing to launch what changed",
    description:
      "cpak records what an application is when you install it and refuses to start it when the store no longer holds that.",
    href: "/announcements/refusing-to-launch-what-changed",
  },
  {
    section: "Desktop",
    date: "August 16, 2026",
    published: "2026-08-16",
    title: "Singularity Desktop arrives as a cpak session",
    description:
      "Singularity Desktop is the first desktop environment to use cpak desktop sessions as an additional distribution path.",
    href: "/announcements/singularity-desktop-sessions",
  },
  {
    section: "Platform",
    date: "August 15, 2026",
    published: "2026-08-15",
    title: "The platform under every official cpak",
    description:
      "Official packages now share versioned Ubuntu 26.04 platform images, narrower toolkit layers and host locale data selected by cpak.",
    href: "/announcements/the-platform-under-every-cpak",
  },
  {
    section: "cpak 2.4",
    date: "August 15, 2026",
    published: "2026-08-15",
    title: "File access without the whole home",
    description:
      "Applications can use their normal file chooser while cpak grants only the file or folder selected by the user.",
    href: "/announcements/file-access-without-the-whole-home",
  },
  {
    section: "Engineering",
    date: "August 14, 2026",
    published: "2026-08-14",
    title: "81 cpak images, 41 GiB lighter",
    description:
      "A full diagnosis across 81 official cpak images cut the data required to download them by 59.8%.",
    href: "/announcements/smaller-images-with-apt",
  },
  {
    section: "Project",
    date: "August 14, 2026",
    published: "2026-08-14",
    title: "cpak moves to LGPLv2.1",
    description:
      "cpak v2.3.1 adopts LGPL-2.1-only for the runtime and all future contributions.",
    href: "/announcements/cpak-moves-to-lgpl-2-1",
  },
  {
    section: "Resolved",
    date: "August 14, 2026",
    published: "2026-08-14",
    title: "FVS Storage startup regression resolved",
    description:
      "cpak v2.2.0 fixes slow application startup introduced by v2.1.x and updates existing installations in place.",
    href: "/announcements/fvs-storage-resolved",
  },
  {
    section: "Incident history",
    date: "August 14, 2026",
    published: "2026-08-14",
    title: "FVS Storage startup regression",
    description:
      "Applications could take several seconds to appear under cpak v2.1.x. The issue was resolved in v2.2.0.",
    href: "/announcements/fvs-storage",
  },
  {
    section: "Release",
    date: "August 12, 2026",
    published: "2026-08-12",
    title: "cpak v2 is here",
    description:
      "Three years after the first sketches, cpak has a stable v2 runtime, a Store and signed application installers.",
    href: "/announcements/cpak-v2-is-here",
  },
  {
    section: "Bottles",
    date: "August 2026",
    published: "2026-08-10",
    title: "Bottles arrives on cpak",
    description:
      "Bottles 66 becomes the first major project to ship cpak alongside Flatpak.",
    href: "/announcements/bottles-on-cpak",
  },
  {
    section: "GUADEC 2025",
    date: "July 24, 2025",
    published: "2025-07-24",
    title: "cpak at GUADEC 2025",
    description:
      "The first public presentation of cpak as an OCI package format for servers, devices and Linux desktops.",
    href: "/announcements/cpak-at-guadec-2025",
  },
  {
    section: "Project history",
    date: "September 2023",
    published: "2023-09-01",
    title: "The first cpak sketches",
    description:
      "The original update and nested package diagrams, revisited against the cpak v2 runtime that exists today.",
    href: "/announcements/the-first-cpak-sketches",
  },
] as const;
