// The worked cases the ceiling board opens with. Each one is a manifest that
// means something and the least policy around it that makes one point.

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
    note: "The same user with no compositor and no extra device nodes. The same policy produces fewer mounts, because a mount is only made where there is something to mount.",
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
    manifest_version: "2.0",
    name: "Fotoritocco",
    description: "A photo editor",
    image: "ghcr.io/example/fotoritocco:3.2",
    binaries: ["/usr/bin/fotoritocco"],
    override,
  });
}

const asks = {
  socketWayland: true,
  socketSystemBus: true,
  socketBluetooth: true,
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
    id: "closes-nothing",
    label: "A ceiling that closes nothing",
    lesson:
      "The ceiling closes deviceAll. The manifest never asked for deviceAll, it asked for deviceDri, and a ceiling decides only the keys it names. The GPU is still there.",
    machine: "wayland",
    manifest: manifest(asks),
    user: "",
    ceiling: format({ deviceAll: false }),
  },
  {
    id: "same-door",
    label: "One door, two names",
    lesson:
      "socketBluetooth mounts the socket socketSystemBus mounts. Closing one and leaving the other would close nothing, so naming either one holds both.",
    machine: "wayland",
    manifest: manifest(asks),
    user: "",
    ceiling: format({ socketSystemBus: false }),
  },
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
