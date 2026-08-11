---
title: Install cpak
description: Install the v2 command, check the host, and understand where cpak keeps its data.
tags: [install, host]
section: start
order: 10
---

# Install cpak

cpak is distributed as one Go binary. It does not require a container daemon and it does not install a second container runtime. The current v2 release candidate is published on GitHub.

## Download the binary

Open the [v2.0.0-rc.4 release](https://github.com/Containerpak/cpak/releases/tag/v2.0.0-rc.4) and download `cpak-linux-amd64` on x86-64 or `cpak-linux-arm64` on ARM64. Download `SHA256SUMS` from the same release, then verify and install the binary on your user `PATH`:

```bash
sha256sum -c --ignore-missing SHA256SUMS
install -Dm755 cpak-linux-amd64 "$HOME/.local/bin/cpak"
cpak --help
```

Replace `cpak-linux-amd64` with `cpak-linux-arm64` on ARM64.

Use the same binary for interactive commands, application lifecycle management, and the local service. A system-wide installation is optional.

## Install an application from the Store

Each application page in the [cpak Store](/store) provides a graphical installer and a menu for copying either the equivalent terminal command or a direct installer URL. The downloaded file contains the cpak binary from the same release and signed metadata for the selected application. That metadata pins the application to an immutable Git commit and records the SHA-256 of the complete installer. The installer verifies both before it writes cpak to `~/.local/bin`, then uses the normal cpak installation path for the manifest, image, dependencies, permissions, and desktop exports.

Browsers normally save downloaded files without the executable bit. Enable execution in the file properties or run:

```bash
chmod +x Application-amd64.cpak-installer
./Application-amd64.cpak-installer
```

Opening it from a desktop session shows the application icon, description, source, progress, and final result in its own window. Starting it from a terminal uses an equivalent text prompt. A changed binary, origin, reference, icon, or description fails verification and stops before cpak is installed.

## Check the host

Run the host capability check before installing an application:

```bash
cpak doctor
cpak doctor --json
```

The report covers user namespaces, rootless OverlayFS, `mount_setattr`, seccomp, Landlock, delegated cgroup v2 controllers, display and audio access, and the controlled host command bridge. A warning explains a missing optional hardening layer or resource controller. A failed required capability prevents the affected runtime path from starting.

> [!NOTE] Host support
> Landlock and delegated cgroups depend on the kernel and session manager. cpak reports their absence instead of claiming that the protection or limit was applied.

## Data locations

cpak follows the XDG base directory convention. Its local store contains package records, content-addressed OCI layers, writable application state, exported desktop entries, logs, and user overrides.

Set the matching XDG environment variable before running cpak if you need a non-default location. Keep the database and layer directories together when moving a store. The references recorded in the database are used by audit, garbage collection, and rollback.

## Desktop integration

Packages may export binaries and `.desktop` files declared by their manifest. cpak writes the user-facing entries below the standard user data directory, so launchers can discover them without a root installation.

Run an installed application from its desktop entry or with `cpak run`. Both paths use the same package state, permissions, and enabled addons.

## Update cpak

Replace the binary with a newer release, then run:

```bash
cpak doctor
cpak audit
```

The package store is upgraded by the runtime when its schema changes. Keep a copy of the store before testing development builds against irreplaceable application data.

## Remove cpak

Removing the binary does not remove installed applications. First remove packages you no longer need, run garbage collection, then delete the remaining user store only if you intend to discard every package and its writable state.

```bash
cpak list
cpak remove github.com/containerpak/example
cpak gc --apply
```
