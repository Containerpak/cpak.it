// The worked cases the migration board opens with, and the reason each legacy
// field becomes what it becomes. The module answers what changed; the notes
// below answer why that is the honest reading of the old field.

import { format } from "$lib/learn/policy";

export type Case = {
  id: string;
  label: string;
  lesson: string;
  manifest: string;
};

export const CASES: Case[] = [
  {
    id: "typical",
    label: "A v1 manifest",
    lesson:
      "Two filesystem flags and a pair of host commands. Each one becomes a typed permission that asks for the same thing in words.",
    manifest: format({
      manifest_version: "1.0",
      name: "Fotoritocco",
      description: "A photo editor",
      image: "ghcr.io/example/fotoritocco:3.2",
      binaries: ["/usr/bin/fotoritocco"],
      override: {
        socketWayland: true,
        deviceDri: true,
        network: true,
        fsHostHome: true,
        fsExtra: ["/mnt/work"],
        allowedHostCommands: ["xdg-open", "notify-send"],
      },
    }),
  },
  {
    id: "whole-host",
    label: "The whole host",
    lesson:
      "fsHost was one flag for every file on the machine. It survives as the grant it always was, written where a reader can see it.",
    manifest: format({
      manifest_version: "1.0",
      name: "Backup",
      description: "A backup tool",
      image: "ghcr.io/example/backup:2.1",
      binaries: ["/usr/bin/backup"],
      override: { network: true, fsHost: true },
    }),
  },
  {
    id: "no-provider",
    label: "A command with no provider",
    lesson:
      "Three host commands have a typed replacement. Anything else is refused rather than dropped, because dropping it would quietly take away what the author asked for.",
    manifest: format({
      manifest_version: "1.0",
      name: "Clipper",
      description: "A video trimmer",
      image: "ghcr.io/example/clipper:1.0",
      binaries: ["/usr/bin/clipper"],
      override: { socketWayland: true, allowedHostCommands: ["ffmpeg"] },
    }),
  },
  {
    id: "already-v2",
    label: "Already v2",
    lesson:
      "A manifest already at version 2 has nothing to migrate, and the answer says so rather than inventing a change.",
    manifest: format({
      manifest_version: "2.0",
      name: "Fotoritocco",
      description: "A photo editor",
      image: "ghcr.io/example/fotoritocco:3.2",
      binaries: ["/usr/bin/fotoritocco"],
      override: {
        socketWayland: true,
        deviceDri: true,
        network: true,
        filesystem: [{ path: "home", access: "read-write" }],
      },
    }),
  },
];

const FIELDS: Record<string, string> = {
  manifest_version:
    "The manifest is read by the version 2 rules from here on, and a legacy filesystem field left in it becomes an error rather than an older spelling.",
  fsHost:
    "The whole host, read-only, arriving at /run/host so an application handed the entire filesystem cannot mistake it for its own root. It is the widest filesystem grant there is.",
  fsHostEtc:
    "The host /etc, read-only. In version 2 it is an ordinary path in the filesystem list, so it can be narrowed like any other.",
  fsHostHome:
    "The home directory, read-write, because that is what the flag did. Nothing narrows it for you: an application that only opens documents should ask for that directory instead.",
  fsExtra:
    "Every extra path becomes a typed grant with read-write access, because version 1 had no way to ask for less. This is the field worth reading again by hand.",
};

const COMMANDS: Record<string, string> = {
  openURI:
    "xdg-open was the host program that opened a link or a file in whatever the desktop uses for it. The permission asks the broker for the same thing, and the command itself is never exposed.",
  notification:
    "notify-send was the host program that put a notification on the screen. The permission asks the broker to post it instead, so the application never runs anything on the host.",
  hostApplications:
    "cpak-launch-app was how one package started another. The permission carries that, and the broker decides whether the application it names may be started.",
};

/** Why a field became what it became, said once per field. */
export function reasonFor(field: string, became: string): string {
  if (field === "allowedHostCommands") return COMMANDS[became] ?? "";
  return FIELDS[field] ?? "";
}
