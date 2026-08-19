// The boards, named once.
//
// A board is one component. It stands on its own under /learn/play, where it is
// a tool somebody reaches for, and it sits in the right column of a lesson,
// where it is the thing the lesson is about. Neither placement owns it, so the
// words that introduce it live here and both read them from the same place.
//
// The components themselves are not listed here on purpose. A page that names
// one imports that one, so a lesson about permissions does not carry the code
// of four boards it never shows, and a page that is only text carries none of
// it and never fetches the decision module.

/** How the decision module is doing, as the board inside a frame reports it. */
export type PlaygroundStatus = {
  phase: "loading" | "ready" | "failed";
  version: string;
  error: string;
  retry: () => void;
};

export type PlaygroundId =
  | "permissions"
  | "filesystem"
  | "ceiling"
  | "migration"
  | "desktop-entry";

export type PlaygroundMeta = {
  id: PlaygroundId;
  /** What it is called wherever it appears. */
  title: string;
  /** One sentence. Not a paragraph, and never two. */
  sentence: string;
  /** Its own address, for a lesson that wants to send somebody to the tool. */
  href: string;
  /** The documentation the board is a demonstration of. */
  reference: { href: string; label: string };
};

export const PLAYGROUNDS: Record<PlaygroundId, PlaygroundMeta> = {
  permissions: {
    id: "permissions",
    title: "Permission board",
    sentence:
      "Tick a permission and read the exact host paths cpak binds into the container, and what each one reaches.",
    href: "/learn/play/permissions",
    reference: { href: "/docs/permissions", label: "Permissions" },
  },
  filesystem: {
    id: "filesystem",
    title: "Filesystem permissions",
    sentence:
      "Write the filesystem list a manifest would carry and read where every entry lands: the directory it comes from on the host, and the path the application finds it at.",
    href: "/learn/play/filesystem",
    reference: { href: "/docs/file-access", label: "File access" },
  },
  ceiling: {
    id: "ceiling",
    title: "The ceiling board",
    sentence:
      "Three parties decide what an application may do: the manifest asks, the owner of the installation may replace that request, and the administrator's ceiling narrows what survived. Change any of them and read what runs.",
    href: "/learn/play/ceiling",
    reference: {
      href: "/docs/managed-deployment",
      label: "Managed deployment",
    },
  },
  migration: {
    id: "migration",
    title: "The migration board",
    sentence:
      "A version 1 manifest reached the host through flags and named the commands it could run; version 2 has neither. Paste one and read the manifest cpak writes for it, field by field.",
    href: "/learn/play/migration",
    reference: { href: "/docs/manifest", label: "The manifest reference" },
  },
  "desktop-entry": {
    id: "desktop-entry",
    title: "Desktop entry",
    sentence:
      "Paste the .desktop file your image ships and read the two files cpak exports for it, line by line.",
    href: "/learn/play/desktop-entry",
    reference: {
      href: "/docs/system-integration",
      label: "System integration",
    },
  },
};

/** The state a board starts in, before it has said anything. */
export function waiting(): PlaygroundStatus {
  return { phase: "loading", version: "", error: "", retry: () => {} };
}
