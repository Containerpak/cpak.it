---
title: Update the cpak runtime
description: Configure CLI and desktop update checks, package-manager builds, and native dialog selection.
tags: [updates, desktop, packaging]
section: operations
order: 22
---

# Update the cpak runtime

cpak checks the latest official GitHub release at most once per day when a command starts. The requested command proceeds when the update endpoint is unavailable.

## Command line

Check without changing the binary:

```bash
cpak self-update --check
```

Download and install the release:

```bash
cpak self-update
```

cpak selects the matching `cpak-linux-ARCH` and `cpak-storaged-linux-ARCH` assets, downloads `SHA256SUMS`, and verifies both binaries. Each file is written to a temporary executable in the current binary directory, synced, and renamed into place. Replacement begins after both assets pass verification.

## Desktop notification

A desktop session shows one notice for each new release. The command that triggered the check continues while the update dialog runs separately.

The backend is selected in this order:

1. the backend configured by the distribution or user
2. the default selected while compiling cpak
3. KDialog on KDE or Zenity on GNOME, Unity, and Cinnamon when the compiled default is `auto`
4. the built-in cpak interface

Set a backend in `~/.config/cpak/cpak.json`, `/etc/cpak/cpak.json`, or `/usr/share/cpak/cpak.json`:

```json
{
  "desktop": {
    "dialog_backend": "kde"
  }
}
```

Supported values are `auto`, `gnome`, `kde`, and `builtin`. A configured native backend falls back to the built-in interface when its tool is unavailable.

Set `CPAK_OPTS_FILE` to test a specific configuration file.

## Distribution packages

Build a package-manager-owned binary with:

```bash
make VERSION=v2.10.4 SELF_UPDATE_MODE=managed DIALOG_BACKEND=auto
```

Managed builds continue to check the official release. The CLI and desktop notice identify the available version and direct the user to the package maintainer. Direct binary replacement is disabled.

`DIALOG_BACKEND` accepts `auto`, `gnome`, `kde`, or `builtin` and applies to both the cpak binary and cpak-installer. A JSON setting still takes precedence, and an unavailable native tool falls back to the built-in interface.

The GitHub workflow uses `SELF_UPDATE_MODE=enabled` and `DIALOG_BACKEND=auto` for official static binaries. Distribution builds set their selected values at compile time.
