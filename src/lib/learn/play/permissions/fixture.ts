// The machine every answer on this page is about, and the manifest the ticks
// are written into.
//
// cpak resolves a mount against the host it is running on: the user id, the
// home directory, a few environment variables and what is actually present on
// disk. A page cannot use the reader's machine for that, and should not want
// to: the point of a board is that two people comparing notes see the same
// paths. So the host is written down here, sent with every question, and shown
// on the page.

export type FixtureHost = {
  uid: number;
  home: string;
  env: Record<string, string>;
  sockets: string[];
  paths: string[];
};

export type Fixture = {
  id: string;
  summary: string;
  host: FixtureHost;
  notes: string[];
};

export const FIXTURE: Fixture = {
  id: "desk-1000",
  summary: "one desktop user on a Wayland session, uid 1000, home /home/ada",
  host: {
    uid: 1000,
    home: "/home/ada",
    env: {
      WAYLAND_DISPLAY: "wayland-0",
      AT_SPI_BUS_ADDRESS: "unix:path=/run/user/1000/at-spi/bus_0",
    },
    sockets: ["/run/user/1000/wayland-0", "/run/user/1000/at-spi/bus_0"],
    paths: [
      "/run/user/1000/wayland-0.lock",
      "/run/user/1000/.mutter-Xwaylandauth.4A2B1C",
      "/dev/dri/card0",
      "/dev/dri/renderD128",
      "/dev/video0",
      "/dev/ttyACM0",
    ],
  },
  notes: [
    "The compositor keeps a lock beside its socket, so the Wayland permission carries both.",
    "There is no NVIDIA card on it, so the graphics permission adds the render nodes and nothing else.",
    "XAUTHORITY is unset, which is why X11 and Wayland together find the Xwayland cookie by name.",
    "One webcam and one serial device are attached. A device permission mounts what is there when the container is built.",
  ],
};

/** A manifest, as far as this board writes one. */
export type Manifest = {
  override?: Record<string, unknown>;
  [field: string]: unknown;
};

export type Ticks = Record<string, boolean>;

/** The package the board asks about. Everything but the override stays put. */
const PACKAGE: Manifest = {
  manifest_version: "2.0",
  name: "notes",
  description: "An example package, so the board has a manifest to judge.",
  image: "ghcr.io/example/notes:2",
  binaries: ["/usr/bin/notes"],
};

/**
 * The manifest a set of ticks describes, written from scratch.
 *
 * The default is the way a package author writes one: the permissions asked
 * for are in the override, and the ones nobody asked for are simply not there.
 * Written out in full is the other habit, the one cpak init produces, where
 * every permission is on the page and most of them are false.
 */
export function manifestFor(
  keys: string[],
  ticks: Ticks,
  explicit: boolean,
): Manifest {
  const override: Record<string, unknown> = {};
  for (const key of keys) {
    if (ticks[key]) override[key] = true;
    else if (explicit) override[key] = false;
  }
  return { ...PACKAGE, override };
}

/**
 * One permission set or cleared in a manifest somebody may have edited. Every
 * other field is left exactly as it was found, including override keys this
 * board has no checkbox for.
 */
export function toggled(
  manifest: Manifest,
  key: string,
  on: boolean,
  explicit: boolean,
): Manifest {
  const override = { ...(asObject(manifest.override) ?? {}) };
  if (on) override[key] = true;
  else if (explicit) override[key] = false;
  else delete override[key];
  return { ...manifest, override };
}

/** Which checkboxes a manifest ticks. Anything but true is not a grant. */
export function ticksOf(manifest: Manifest, keys: string[]): Ticks {
  const override = asObject(manifest.override) ?? {};
  const ticks: Ticks = {};
  for (const key of keys) {
    if (override[key] === true) ticks[key] = true;
  }
  return ticks;
}

export function format(manifest: Manifest): string {
  return JSON.stringify(manifest, null, 2);
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}
