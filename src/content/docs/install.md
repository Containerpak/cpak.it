---
title: Install cpak
description: Install the v2 command, check the host, and understand where cpak keeps its data.
tags: [install, host]
section: start
order: 10
---

# Install cpak

cpak is distributed as one Go binary and pulls OCI content directly. Docker, Podman, crane, registry credential helpers, and a background image service are not runtime requirements.

## Download the binary

Open the [latest cpak release](https://github.com/Containerpak/cpak/releases/latest) and download `cpak-linux-amd64` on x86-64 or `cpak-linux-arm64` on ARM64. Download `SHA256SUMS` from the same release, then verify and install the binary on your user `PATH`:

```bash
sha256sum -c --ignore-missing SHA256SUMS
install -Dm755 cpak-linux-amd64 "$HOME/.local/bin/cpak"
cpak --help
```

Replace `cpak-linux-amd64` with `cpak-linux-arm64` on ARM64.

Use the same binary for interactive commands, application lifecycle management, and the local service. A system-wide installation is optional.

## Install an application from the Store

Each application page in the [cpak Store](/store) provides a signed graphical installer, the equivalent terminal command, and a direct installer URL. The downloaded file installs cpak and the selected application.

Browsers normally save downloaded files without the executable bit. Enable execution in the file properties or run:

```bash
chmod +x Application-amd64.cpak-installer
./Application-amd64.cpak-installer
```

Opening it from a desktop session shows the application details, requested permissions, progress, and final result. Starting it from a terminal uses an equivalent text prompt. Read [cpak-installer](/docs/cpak-installer) for verification details, metadata inspection, direct links, and developer integration.

## Check the host

Run the host capability check before installing an application:

```bash
cpak doctor
cpak doctor --json
```

The report covers user namespaces, rootless OverlayFS, `mount_setattr`, seccomp, Landlock, delegated cgroup v2 controllers, display and audio access, and the controlled host command bridge. A warning explains a missing optional hardening layer or resource controller. A failed required capability prevents the affected runtime path from starting.

> [!NOTE] Host support
> Landlock and delegated cgroups depend on the kernel and session manager. `cpak doctor` reports whether each feature is active.

## Data locations

cpak follows the XDG base directory convention. Its local store contains package records, content-addressed OCI layers, writable application state, exported desktop entries, logs, and user overrides.

Set the matching XDG environment variable before running cpak if you need a non-default location. Keep the database and layer directories together when moving a store. The references recorded in the database are used by audit, garbage collection, and rollback.

## Desktop integration

Packages may export binaries and `.desktop` files declared by their manifest. cpak writes the user-facing entries below the standard user data directory, so launchers can discover them without a root installation.

Run an installed application from its desktop entry or with `cpak run`. Both paths use the same package state, permissions, and enabled addons.

## Update cpak

Check and install a newer cpak release:

```bash
cpak self-update --check
cpak self-update
cpak doctor
cpak audit
```

On a desktop, cpak checks once per day while another command runs. GNOME uses Zenity when it is installed, KDE uses KDialog, and other sessions use the built-in cpak dialog. The update is downloaded from the official release, checked against `SHA256SUMS`, written beside the current binary, and installed with an atomic rename. Applications that are already running continue to use their existing process.

A distribution package can disable binary replacement at build time. cpak still reports that a newer version exists and tells the user to request it from the package maintainer. Read [cpak runtime updates](/docs/runtime-updates) for packager configuration and desktop backend selection.

## Remove cpak

Removing the binary does not remove installed applications. First remove packages you no longer need, run garbage collection, then delete the remaining user store only if you intend to discard every package and its writable state.

```bash
cpak list
cpak remove github.com/containerpak/example
cpak gc --apply
```
