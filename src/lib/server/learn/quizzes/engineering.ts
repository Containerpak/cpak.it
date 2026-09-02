import type { QuizQuestion } from "$lib/learn/quiz";

export const QUESTIONS: QuizQuestion[] = [
  {
    asks: "An addon contains a Vulkan library but the parent has no device grant. What changes when the addon is enabled?",
    choices: [
      {
        text: "The library appears in the composed root, but the parent gains no device access",
        correct: true,
        why: "Composition adds files. Effective host permissions still come from the parent policy.",
      },
      {
        text: "The addon's device permission is merged into the parent",
        why: "An addon cannot expand the host policy of its parent.",
      },
      {
        text: "The addon starts as a nested package automatically",
        why: "An addon contributes layers. A nested dependency is a different relationship.",
      },
    ],
  },
  {
    asks: "Which sandbox layer controls whether the application can call clone with a new user namespace?",
    choices: [
      {
        text: "The mount namespace",
        why: "Mounts decide which filesystem objects exist, not which system calls are accepted.",
      },
      {
        text: "The seccomp policy derived from userNamespaces",
        correct: true,
        why: "Nested user namespace calls are filtered unless the manifest grants that capability.",
      },
      {
        text: "The storage driver",
        why: "Storage prepares layer checkouts and does not decide process system calls.",
      },
    ],
  },
  {
    asks: "Why can a podman compatibility shim remain bounded?",
    choices: [
      {
        text: "It forwards the command only after asking the user",
        why: "Forwarding arbitrary commands would still be an arbitrary host execution channel.",
      },
      {
        text: "It parses a finite CLI subset into typed provider requests",
        correct: true,
        why: "Unknown commands and flags fail locally, while allowed operations keep their streams and exit status.",
      },
      {
        text: "Podman is rootless",
        why: "The backend being rootless does not limit which host containers a command may alter.",
      },
    ],
  },
  {
    asks: "A storage driver crashes while preparing the third of five layers. What must remain true?",
    choices: [
      {
        text: "The previous valid runtime index and published checkouts remain usable",
        correct: true,
        why: "Preparation publishes atomically and derived data is rebuilt without invalidating the last good view.",
      },
      {
        text: "All five source layers are removed",
        why: "Source layers are immutable inputs and the driver must not alter them.",
      },
      {
        text: "The partial checkout becomes the new runtime index",
        why: "Only a complete, validated result may be published.",
      },
    ],
  },
  {
    asks: "A vendor replaces a file at the same HTTPS URL. Which runtime source field prevents accepting it silently?",
    choices: [
      {
        text: "name",
        why: "The name controls the local artifact name, not its content identity.",
      },
      {
        text: "sha256, together with the declared size",
        correct: true,
        why: "Both are verified before the artifact is installed into the managed layer.",
      },
      {
        text: "architecture",
        why: "Architecture selects a target but does not authenticate bytes.",
      },
    ],
  },
  {
    asks: "Two installed SDK addons provide the exclusive slot sdk.go. What decides which one reaches VS Code?",
    choices: [
      {
        text: "The last addon listed in the Store",
        why: "The Store does not select providers for an installed application.",
      },
      {
        text: "The provider selected for that parent application's slot",
        correct: true,
        why: "Exclusive slot selection is local to the parent and remains explicit across provider installs.",
      },
      {
        text: "Both are added to PATH in manifest order",
        why: "That is the behavior of a multiple slot, not an exclusive one.",
      },
    ],
  },
  {
    asks: "Which storage driver response order is correct for OverlayFS lower directories?",
    choices: [
      {
        text: "Highest priority first",
        correct: true,
        why: "The protocol fixes this order so composed layer precedence is preserved.",
      },
      {
        text: "Oldest layer first",
        why: "Age is not the package composition order.",
      },
      {
        text: "Any order, because OverlayFS sorts them",
        why: "OverlayFS uses the supplied order; it does not infer package precedence.",
      },
    ],
  },
  {
    asks: "Why does the prepared launch read a runtime index instead of calling the storage driver?",
    choices: [
      {
        text: "To avoid a maintenance daemon round trip on every start",
        correct: true,
        why: "The driver prepares and verifies; the atomic index carries the ready lower directories into the launch path.",
      },
      {
        text: "Because the storage driver runs as root",
        why: "Official and external drivers run for the user; root is not part of the contract.",
      },
      {
        text: "Because the index contains application data",
        why: "Application data is separate from rebuildable layer checkouts.",
      },
    ],
  },
  {
    asks: "A parent starts a declared nested package. Which permission boundary applies to the child?",
    choices: [
      {
        text: "The child's manifest alone",
        why: "A nested dependency cannot use its separate environment to escape the parent boundary.",
      },
      {
        text: "The intersection of the child policy and the parent boundary",
        correct: true,
        why: "The host resolves the declared dependency and narrows its effective policy through the parent.",
      },
      {
        text: "The parent policy alone",
        why: "The child still has its own manifest and local policy; the parent cannot grant what the child never requested.",
      },
    ],
  },
  {
    asks: "A host has no usable systemd user manager. What happens to an enabled cpak application service?",
    choices: [
      {
        text: "cpak selects cron or XDG autostart and keeps the same service definition",
        correct: true,
        why: "Boot activation is an adapter. The cpak service manager and application launch path do not depend on systemd or D-Bus.",
      },
      {
        text: "The service is rejected because persistence requires systemd",
        why: "systemd is one available boot adapter, not a runtime dependency.",
      },
      {
        text: "The package must request hostNetwork before it can restart",
        why: "Network permissions do not select or enable a boot adapter.",
      },
    ],
  },
  {
    asks: "Verified launch finds that a prepared checkout contradicts its recorded layer state while enforcement is off. What happens?",
    choices: [
      {
        text: "The application starts because enforcement is off",
        why: "Enforcement controls unknown state, not a known contradiction inside the store.",
      },
      {
        text: "The checkout is trusted because its OCI digest was checked during install",
        why: "The launch is checking the current store against the state recorded at installation.",
      },
      {
        text: "The launch is refused as tampered",
        correct: true,
        why: "A known disagreement is refused at every enforcement level.",
      },
    ],
  },
];
