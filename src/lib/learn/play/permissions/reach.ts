type Note = { match: RegExp; reach: string };

const MOUNTS: Note[] = [
  {
    match: /^\/run\/user\/\d+\/wayland-[^/]+\.lock$/,
    reach:
      "The lock beside the compositor socket, carried when the compositor keeps one.",
  },
  {
    match: /^\/run\/user\/\d+\/[^/]*wayland[^/]*$/i,
    reach:
      "The compositor socket. This is the window itself: the application draws through it and gets the keyboard and pointer input the compositor sends it.",
  },
  {
    match: /^\/run\/user\/\d+\/pulse\/native$/,
    reach:
      "The audio socket: playback, and every capture device the sound server offers, which includes the microphone.",
  },
  {
    match: /^\/run\/user\/\d+\/ssh-agent\.socket$/,
    reach:
      "The SSH agent. The keys never leave it, but anything holding this socket can have it sign, which is enough to log in wherever those keys work.",
  },
  {
    match: /^\/run\/user\/\d+\/gnupg\/S\.gpg-agent$/,
    reach:
      "The GPG agent, on the same terms: signing and decryption with keys that stay inside it.",
  },
  {
    match: /^\/run\/cups\/cups\.sock$/,
    reach:
      "The printing socket: the printers this machine knows about, and the jobs sent to them.",
  },
  {
    match: /^\/run\/user\/\d+\/at-spi\//,
    reach:
      "The accessibility bus. It is how a screen reader reads other applications, which means it can read them too, and drive them.",
  },
  {
    match: /^\/dev\/$/,
    reach:
      "The whole device tree. Everything the separate device permissions grant is below it, which is why they stop mattering once this one is on.",
  },
  {
    match: /^\/dev\/dri\/$/,
    reach: "The graphics devices: the render nodes and the display cards.",
  },
  {
    match: /^\/dev\/nvidia/,
    reach: "An NVIDIA device node, matched on this host.",
  },
  {
    match: /^\/dev\/kvm$/,
    reach:
      "Hardware virtualisation. A package with it can run virtual machines.",
  },
  {
    match: /^\/dev\/shm\/$/,
    reach:
      "Shared memory, which is how large buffers move between processes without a copy. It is shared with the rest of the session.",
  },
  {
    match: /^\/dev\/snd\/$/,
    reach:
      "The ALSA devices, which is the sound hardware itself rather than a sound server.",
  },
  {
    match: /^\/dev\/video\d*$/,
    reach: "A capture device. On this fixture that is the webcam.",
  },
  {
    match: /^\/dev\/fuse$/,
    reach:
      "The FUSE control device: the package can mount filesystems of its own.",
  },
  {
    match: /^\/dev\/net\/tun$/,
    reach:
      "TUN and TAP, which is what a VPN client needs to create a network interface.",
  },
  {
    match: /^\/dev\/(bus\/)?usb\/$/,
    reach: "The USB devices, all of them, as raw devices.",
  },
  {
    match: /^\/dev\/tty(USB|ACM)\d+$/,
    reach:
      "A serial port. Boards, printers, radios and meters arrive as one of these.",
  },
  {
    match: /^\/dev\/input\/$/,
    reach:
      "The input devices. That is every keystroke and pointer movement of the session, not only the ones aimed at this window.",
  },
  { match: /^\/dev\/tty$/, reach: "The controlling terminal." },
  { match: /^\/etc\/$/, reach: "The host's system configuration." },
];

const SHIMS: Record<string, string> = {
  "notify-send":
    "A command inside the container with the name of the host one. It writes a notification request, and the broker decides what reaches the desktop.",
  "xdg-open":
    "A command inside the container with the name of the host one. It hands one URI to the broker, which opens it. Nothing of the host is mounted for this.",
  gio: "The same request as xdg-open, through the GIO name, and the same broker on the other side.",
  "cpak-launch-app":
    "Launch requests for host applications, by opaque identifier. The broker picks which desktop entry that identifier means.",
  "cpak-file-picker":
    "The native file chooser. What you pick is what the package receives, and nothing around it.",
  podman:
    "The containers host action provider, reached as typed requests rather than the host socket.",
  docker: "The same provider under the other name.",
};

const QUIET: Record<string, string> = {
  network:
    "No path is bound. It adds internet and LAN access to a private network namespace while host loopback stays blocked. Without it that namespace has no route off the machine.",
  process:
    "No path is bound. It shares the host process namespace, so the package sees processes that are not in the sandbox.",
  userNamespaces:
    "No path is bound. It lets the application create a nested user namespace, which is what a browser needs for its own sandbox.",
  asRoot: "No path is bound. The process runs as uid 0 inside the container.",
};

export const DECIDING: Record<string, string> = {
  clipboard:
    "Only the declared clipboard directions cross the private X11 display, and file list targets stay blocked.",
  sessionBus:
    "Only the destinations, paths, interfaces and methods written in the policy pass through the private bus proxy.",
  bluetooth:
    "The general BlueZ API passes through a private proxy without exposing unrelated system bus services.",
  displayX11:
    "A private compatibility display replaces access to the raw host X11 socket.",
  deviceAll:
    "Every device node on the machine, and it swallows the separate device permissions.",
  process:
    "The host process namespace. What is inside the sandbox can see, and signal, what is outside it.",
  hostNetwork:
    "The host network namespace, including localhost services and host ports.",
  userNamespaces:
    "Nested user namespaces, which is what a browser needs to build its own sandbox inside this one.",
  asRoot:
    "uid 0 inside the container, so nothing the image itself sets up stands in the way of the package.",
};

export function reachOf(path: string): string {
  for (const note of MOUNTS) {
    if (note.match.test(path)) return note.reach;
  }
  return "This host path is bound into the container as it is on the host.";
}

export function reachOfShim(name: string): string {
  return (
    SHIMS[name] ??
    "A command inside the container that forwards one typed request to the host broker."
  );
}

export function reachOfQuiet(key: string): string {
  return (
    QUIET[key] ?? "No host path is bound for this permission on this fixture."
  );
}
