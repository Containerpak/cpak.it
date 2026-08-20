import type { Policy } from "$lib/learn/policy";
import { reachOfQuiet } from "./reach";

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
  wide: boolean;
  mounts: string[];
  shims: string[];
  swallows: string[];
  twins: string[];
};

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

function same(paths: string[], mounts: string[]): boolean {
  return (
    paths.length === mounts.length &&
    paths.every((path) => mounts.includes(path))
  );
}

function directory(path: string): boolean {
  return path.endsWith("/");
}

function within(path: string, dir: string): boolean {
  return directory(dir) && path.startsWith(dir);
}
