import { format, type Host } from "$lib/learn/policy";

export type Machine = {
  id: string;
  label: string;
  note: string;
  host: Host;
};

export const MACHINES: Machine[] = [
  {
    id: "wayland",
    label: "Wayland session",
    note: "A compositor socket with a lock beside it, an accessibility bus, and an NVIDIA node under /dev.",
    host: {
      uid: 1000,
      home: "/home/ada",
      env: { WAYLAND_DISPLAY: "wayland-0" },
      paths: ["/run/user/1000/wayland-0.lock", "/dev/nvidia0"],
      sockets: ["/run/user/1000/wayland-0", "/run/user/1000/at-spi/bus_0"],
    },
  },
  {
    id: "headless",
    label: "Headless host",
    note: "The same user with no compositor and no extra device nodes. The same policy makes fewer mounts, because a mount is only made where there is something to mount.",
    host: { uid: 1000, home: "/home/ada", env: {}, paths: [], sockets: [] },
  },
];

export type Case = {
  id: string;
  label: string;
  lesson: string;
  machine: string;
  manifest: string;
  user: string;
  ceiling: string;
};

function manifest(override: Record<string, unknown>): string {
  return format({
    $schema:
      "https://raw.githubusercontent.com/Containerpak/cpak/v2/schema/manifest-v3.json",
    manifest_version: "3.0",
    name: "Fotoritocco",
    description: "A photo editor",
    version: "3.2",
    image:
      "ghcr.io/example/fotoritocco@sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    binaries: ["/usr/bin/fotoritocco"],
    idle_time: 5,
    override,
  });
}

const asks = {
  socketWayland: true,
  bluetooth: true,
  sessionBus: {
    talk: [
      {
        name: "org.example.Documents",
        path: "/org/example/Documents",
        interface: "org.example.Documents",
        members: ["List", "Open"],
      },
    ],
  },
  deviceDri: true,
  network: true,
  openURI: true,
  filesystem: [
    { path: "home", access: "read-write" },
    { path: "/mnt/work", access: "read-write" },
  ],
};

export const CASES: Case[] = [
  {
    id: "one-directory",
    label: "Held to one directory",
    lesson:
      "The ceiling allows read-only access to the home directory. The home request is narrowed to it and /mnt/work is dropped, because a path the ceiling does not cover is not downgraded, it is gone.",
    machine: "wayland",
    manifest: manifest(asks),
    user: "",
    ceiling: format({ filesystem: [{ path: "home", access: "read-only" }] }),
  },
  {
    id: "unmanaged",
    label: "No ceiling",
    lesson:
      "Nothing stands above the manifest, so the application runs with what it asked for and the mounts follow from that.",
    machine: "wayland",
    manifest: manifest(asks),
    user: "",
    ceiling: "",
  },
  {
    id: "exact-bus",
    label: "One exact bus rule",
    lesson:
      "The application asks for two methods on one session service. The ceiling keeps only List, so Open disappears without exposing the raw session bus.",
    machine: "wayland",
    manifest: manifest(asks),
    user: "",
    ceiling: format({
      sessionBus: {
        talk: [
          {
            name: "org.example.Documents",
            path: "/org/example/Documents",
            interface: "org.example.Documents",
            members: ["List"],
          },
        ],
      },
    }),
  },
  {
    id: "closes-nothing",
    label: "A ceiling that closes nothing",
    lesson:
      "The ceiling closes deviceAll. The manifest never asked for deviceAll: it asked for deviceDri, which the ceiling does not name. The GPU is still there.",
    machine: "wayland",
    manifest: manifest(asks),
    user: "",
    ceiling: format({ deviceAll: false }),
  },
  {
    id: "owner",
    label: "The owner decides",
    lesson:
      "An override written by the owner of the installation replaces the manifest request rather than adding to it. The ceiling then narrows whatever survived.",
    machine: "wayland",
    manifest: manifest(asks),
    user: format({
      socketWayland: true,
      deviceDri: true,
      network: true,
      filesystem: [{ path: "/mnt/work", access: "read-only" }],
    }),
    ceiling: format({ network: false }),
  },
];
