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
  title: string;
  sentence: string;
  href: string;
  reference: { href: string; label: string };
};

export const PLAYGROUNDS: Record<PlaygroundId, PlaygroundMeta> = {
  permissions: {
    id: "permissions",
    title: "Permissions",
    sentence:
      "Edit a cpak.json and inspect the exact host paths and broker operations each permission opens.",
    href: "/learn/play/permissions",
    reference: { href: "/docs/permissions", label: "Permissions" },
  },
  filesystem: {
    id: "filesystem",
    title: "Filesystem access",
    sentence:
      "Resolve filesystem grants against a host and inspect every source and sandbox path.",
    href: "/learn/play/filesystem",
    reference: { href: "/docs/file-access", label: "File access" },
  },
  ceiling: {
    id: "ceiling",
    title: "Ceiling",
    sentence:
      "Compare the manifest, user override and administrator ceiling to inspect the policy that reaches the application.",
    href: "/learn/play/ceiling",
    reference: {
      href: "/docs/managed-deployment",
      label: "Managed deployment",
    },
  },
  migration: {
    id: "migration",
    title: "Manifest migration",
    sentence:
      "Convert a version 1 manifest and inspect the complete version 2 output and every rewritten field.",
    href: "/learn/play/migration",
    reference: { href: "/docs/manifest", label: "The manifest reference" },
  },
  "desktop-entry": {
    id: "desktop-entry",
    title: "Desktop entries",
    sentence:
      "Edit a desktop entry and inspect the exported launcher and compatibility alias cpak writes.",
    href: "/learn/play/desktop-entry",
    reference: {
      href: "/docs/system-integration",
      label: "System integration",
    },
  },
};

export function waiting(): PlaygroundStatus {
  return { phase: "loading", version: "", error: "", retry: () => {} };
}
