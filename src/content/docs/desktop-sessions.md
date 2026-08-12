---
title: Desktop and kiosk sessions
description: Package a complete Wayland desktop or a focused login session with cpak.
tags: [desktop, kiosk, sessions]
section: packages
order: 45
---

# Desktop and kiosk sessions

A cpak can remain a normal application package and also offer a login session. The session uses the same installed package, writable state, user profile, and update channel as a windowed launch.

## Manifest

Declare an exported entrypoint and a separate permission set:

```json
"sessions": [
  {
    "id": "dev.sinty.singularity",
    "name": "Singularity Desktop",
    "description": "Singularity Desktop session",
    "kind": "desktop",
    "entrypoint": "/usr/bin/singularity-session",
    "override": {
      "deviceDri": true,
      "deviceInput": true,
      "hostApplications": true,
      "filesystem": [
        { "path": "xdg-documents", "access": "read-write" },
        { "path": "xdg-download", "access": "read-write" }
      ]
    }
  }
]
```

`kind` accepts `desktop` and `kiosk`. The identifier is global and cannot replace a system session or a session owned by another package. The entrypoint must also appear in `binaries`.

## System authority

Install the system authority once:

```bash
cpak system setup
cpak system status
```

The setup installs a fixed root-owned launcher, D-Bus activation policy, and Polkit actions. It does not install a package session automatically.

## Register a session

```bash
cpak session list github.com/singularityos-lab/singularity-desktop
cpak session enable github.com/singularityos-lab/singularity-desktop dev.sinty.singularity
```

cpak shows the session permissions before registration. Polkit then asks for authorization. The privileged service receives validated metadata and a package origin, never an executable supplied by the caller. The generated display manager entry calls the fixed cpak launcher with the registered session identifier.

Remove one session with:

```bash
cpak session disable dev.sinty.singularity
```

Removing the last installed package version which provides that identifier also unregisters it. `cpak system remove` removes registered cpak sessions before deleting the system authority.

## Distribution support

The package image remains a normal OCI image. A distribution can install the same desktop through its existing build without adding the cpak manifest to the runtime. The session declaration only affects cpak installations.

The runtime does not require systemd. A display manager must be able to read the registered Wayland session directory. cpak configures SDDM when it is installed and keeps trusted system session entries available in that directory.
