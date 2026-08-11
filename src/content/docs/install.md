---
title: Install Cpak
description: Install the v2 command, check the host, and understand where Cpak keeps its data.
tags: [install, host]
section: start
order: 10
---

# Install Cpak

Cpak is distributed as one Go binary. It does not require a container daemon and it does not install a second container runtime. The current v2 builds are published through the continuous release on GitHub.

## Download the binary

Open the [continuous release](https://github.com/Containerpak/cpak/releases/tag/continuous), download the archive for your architecture, and place `cpak` on your user `PATH`:

```bash
install -Dm755 cpak "$HOME/.local/bin/cpak"
cpak --help
```

Use the same binary for interactive commands, application lifecycle management, and the local service. A system-wide installation is optional.

## Check the host

Run the host capability check before installing an application:

```bash
cpak doctor
cpak doctor --json
```

The report covers user namespaces, rootless OverlayFS, `mount_setattr`, seccomp, Landlock, delegated cgroup v2 controllers, display and audio access, and the controlled host command bridge. A warning explains a missing optional hardening layer or resource controller. A failed required capability prevents the affected runtime path from starting.

> [!NOTE] Host support
> Landlock and delegated cgroups depend on the kernel and session manager. Cpak reports their absence instead of claiming that the protection or limit was applied.

## Data locations

Cpak follows the XDG base directory convention. Its local store contains package records, content-addressed OCI layers, writable application state, exported desktop entries, logs, and user overrides.

Set the matching XDG environment variable before running Cpak if you need a non-default location. Keep the database and layer directories together when moving a store. The references recorded in the database are used by audit, garbage collection, and rollback.

## Desktop integration

Packages may export binaries and `.desktop` files declared by their manifest. Cpak writes the user-facing entries below the standard user data directory, so launchers can discover them without a root installation.

Run an installed application from its desktop entry or with `cpak run`. Both paths use the same package state, permissions, and enabled addons.

## Update Cpak

Replace the binary with a newer continuous build, then run:

```bash
cpak doctor
cpak audit
```

The package store is upgraded by the runtime when its schema changes. Keep a copy of the store before testing development builds against irreplaceable application data.

## Remove Cpak

Removing the binary does not remove installed applications. First remove packages you no longer need, run garbage collection, then delete the remaining user store only if you intend to discard every package and its writable state.

```bash
cpak list
cpak remove github.com/containerpak/example
cpak gc --apply
```
