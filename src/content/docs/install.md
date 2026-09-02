---
title: Install cpak
description: Install the current cpak runtime, check the host, and understand where cpak keeps its data.
tags: [install, host]
section: start
order: 10
---

# Install cpak

cpak is distributed as two static Go binaries and pulls OCI content through the Distribution API. The `cpak` command owns package and application lifecycle. `cpak-storaged` prepares and verifies native layer checkouts during installation, update, or maintenance, then exits. A prepared application starts directly from its runtime index.

## Download the binary

Open the [latest cpak release](https://github.com/Containerpak/cpak/releases/latest) and download `cpak-linux-amd64` plus `cpak-storaged-linux-amd64` on x86-64, or the two matching `arm64` assets on ARM64. Download `SHA256SUMS` from the same release, then verify and install both binaries on your user `PATH`:

```bash
sha256sum -c --ignore-missing SHA256SUMS
install -Dm755 cpak-linux-amd64 "$HOME/.local/bin/cpak"
install -Dm755 cpak-storaged-linux-amd64 "$HOME/.local/bin/cpak-storaged"
cpak --help
```

Replace both `amd64` asset names with their `arm64` variants on ARM64.

Keep both binaries in the same directory. cpak discovers its storage service beside the active command before checking the user `PATH`. A system-wide installation is optional. The graphical installer and `cpak self-update` replace both files together and prepare existing application storage before returning.

## NixOS

Add the cpak flake module to install the runtime and system authority declaratively:

```nix
inputs.cpak.url = "github:Containerpak/cpak/v2";

imports = [ inputs.cpak.nixosModules.default ];
services.cpak.enable = true;
```

The module package includes `slirp4netns` for applications that request isolated network access. `cpak system setup` checks the module-managed integration and does not write to `/etc`.

## Install an application from the Store

Each application page in the [cpak Store](/store) provides a signed graphical installer, the equivalent terminal command, and a direct installer URL. The downloaded file installs cpak, its matching storage service, and the selected application.

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

On a desktop, cpak checks once per day while another command runs. GNOME uses Zenity when it is installed, KDE uses KDialog, and other sessions use the built-in cpak dialog. Both runtime assets are downloaded from the official release, checked against `SHA256SUMS`, written beside the current binaries, and installed with atomic renames. Applications that are already running continue to use their existing processes.

The first update that introduces a newer storage layout prepares installed layers before the next application starts. The operation is atomic and resumable. Desktop launches show a progress dialog when preparation takes longer than 400 milliseconds; terminal launches report progress in the terminal.

A distribution package can disable binary replacement at build time. cpak still reports that a newer version exists and tells the user to request it from the package maintainer. Read [cpak runtime updates](/docs/runtime-updates) for packager configuration and desktop backend selection.

## Remove cpak

Application data remains in the local store after removing the runtime binaries. Remove unwanted packages and run garbage collection before deleting the store. Deleting the store discards every installed package and its writable state.

```bash
cpak list
cpak remove github.com/containerpak/example
cpak gc --apply
```

When an origin has one installed copy, `cpak remove` reads its branch, release,
or commit from the local package record. If several copies are installed, pass
the matching `--branch`, `--release`, or `--commit` selector.

Normal removal deletes the package record, containers, desktop integration, and
unshared layers. It keeps the private application home and persistent file
grants so a later reinstall can use them. Delete that state explicitly when it
is no longer needed:

```bash
cpak remove --purge github.com/containerpak/example
```

`cpak gc --apply` reclaims unused shared storage and download cache. It is not
required to finish package removal and does not delete a retained private home.
