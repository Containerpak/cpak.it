// What a permission weighs, worked out from what the module answers rather
// than from a list of the dangerous ones kept beside it.
//
// cpak has no ranking of permissions and this board must not invent one. What
// cpak does answer is "what does this permission bind, on its own, on this
// host", and that answer already separates the rows that open one named thing
// from the rows that do not:
//
//   - a permission whose path the paths of other permissions sit inside opens
//     all of them at once, and the ones underneath it stop mattering;
//   - a permission that binds a message bus opens whatever is listening on
//     that bus, which is settled on the host rather than in the manifest;
//   - a permission that binds no path and adds no command changes what the
//     container is, which is the one thing a list of mounts cannot show.
//
// Everything else opens exactly what it names, and the board says so.

import type { Policy } from "$lib/learn/policy";
import { reachOfQuiet } from "./reach";

/**
 * The two sockets that are message buses. Reaching one is not reaching a
 * service: it is reaching the place where services are found, and which ones
 * answer is a fact about the host rather than about the package.
 */
const BUSES = [/^\/run\/user\/\d+\/bus$/, /^\/run\/dbus\/system_bus_socket$/];

export type Kind =
  | "tree"
  | "bus"
  | "container"
  | "broker"
  | "directory"
  | "node";

export type Weighed = {
  key: string;
  kind: Kind;
  /** True for the kinds that open more than the thing the key names. */
  wide: boolean;
  mounts: string[];
  shims: string[];
  /** Permissions whose every path is inside a path this one binds. */
  swallows: string[];
  /** Permissions binding exactly the same paths: one door under two names. */
  twins: string[];
};

/** Everything a board needs to know about one permission, in one answer each. */
export function weigh(alone: Map<string, Policy>): Map<string, Weighed> {
  const weighed = new Map<string, Weighed>();
  for (const [key, own] of alone) {
    const mounts = own.mounts ?? [];
    const shims = own.shims ?? [];
    const swallows: string[] = [];
    const twins: string[] = [];
    for (const [other, policy] of alone) {
      if (other === key) continue;
      const paths = policy.mounts ?? [];
      if (paths.length === 0) continue;
      if (same(paths, mounts)) twins.push(other);
      else if (paths.every((path) => mounts.some((dir) => within(path, dir)))) {
        swallows.push(other);
      }
    }
    const kind = kindOf(mounts, shims, swallows);
    weighed.set(key, {
      key,
      kind,
      wide: kind === "tree" || kind === "bus" || kind === "container",
      mounts,
      shims,
      swallows,
      twins,
    });
  }
  return weighed;
}

function kindOf(mounts: string[], shims: string[], swallows: string[]): Kind {
  if (mounts.length === 0) return shims.length > 0 ? "broker" : "container";
  if (mounts.some((path) => BUSES.some((bus) => bus.test(path)))) return "bus";
  if (swallows.length > 0) return "tree";
  if (mounts.some(directory)) return "directory";
  return "node";
}

/** Why this permission is wider than its name, in the terms it was measured in. */
export function noteOf(weighed: Weighed): string {
  switch (weighed.kind) {
    case "tree": {
      const [widest] = weighed.mounts;
      return `Binds ${widest}, and ${weighed.swallows.length} of the permissions below bind paths inside it. While this one is on, ticking those changes nothing.`;
    }
    case "bus": {
      const bus = weighed.mounts.find((path) =>
        BUSES.some((match) => match.test(path)),
      );
      const twins =
        weighed.twins.length > 0
          ? ` ${weighed.twins.join(" and ")} binds the same socket, so closing one of the two closes nothing.`
          : "";
      return `Binds ${bus}, which is a bus rather than a service: what a package reaches through it is whatever the host has listening on it.${twins}`;
    }
    case "container":
      return reachOfQuiet(weighed.key);
    default:
      return "";
  }
}

/** A path bound by both, in the same order or not. */
function same(paths: string[], mounts: string[]): boolean {
  return (
    paths.length === mounts.length &&
    paths.every((path) => mounts.includes(path))
  );
}

/** cpak writes a directory mount with a trailing slash, and binds all of it. */
function directory(path: string): boolean {
  return path.endsWith("/");
}

function within(path: string, dir: string): boolean {
  return directory(dir) && path.startsWith(dir);
}
