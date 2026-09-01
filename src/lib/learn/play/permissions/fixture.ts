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
      "/dev/dri/card0",
      "/dev/dri/renderD128",
      "/dev/video0",
      "/dev/ttyACM0",
    ],
  },
  notes: [
    "The compositor keeps a lock beside its socket, so the Wayland permission carries both.",
    "There is no NVIDIA card on it, so the graphics permission adds the render nodes and nothing else.",
    "The isolated X11 compatibility display uses a private endpoint, so no host Xauthority file is part of this fixture.",
    "One webcam and one serial device are attached. A device permission mounts what is there when the container is built.",
  ],
};

export type Manifest = {
  override?: Record<string, unknown>;
  [field: string]: unknown;
};

export type Ticks = Record<string, boolean>;

const PACKAGE: Manifest = {
  $schema:
    "https://raw.githubusercontent.com/Containerpak/cpak/v2/schema/manifest-v3.json",
  manifest_version: "3.0",
  name: "notes",
  description: "An example package for permission inspection.",
  version: "3.0",
  image:
    "ghcr.io/example/notes@sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  binaries: ["/usr/bin/notes"],
  idle_time: 5,
};

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
