---
title: Desktop and kiosk sessions
description: Package a complete Wayland desktop or a focused login session with cpak.
tags: [desktop, kiosk, sessions]
section: packages
order: 45
---

# Desktop and kiosk sessions

A package can declare a login session beside its application entrypoints. Windowed and login launches use the same installed version, writable state, user profile, and update channel.

## Manifest

Declare an exported entrypoint and a separate permission set:

```json
"sessions": [
  {
    "id": "com.example.desktop",
    "name": "Example Desktop",
    "description": "Example desktop session",
    "kind": "desktop",
    "entrypoint": "/usr/bin/example-session",
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

The setup installs a fixed root-owned launcher, D-Bus activation policy, and Polkit actions. Package sessions are registered separately.

## Register a session

```bash
cpak session list github.com/example/desktop
cpak session enable github.com/example/desktop com.example.desktop
```

cpak shows the session permissions before registration. Polkit then asks for authorization. The privileged service receives validated metadata and a package origin, never an executable supplied by the caller. The generated display manager entry calls the fixed cpak launcher with the registered session identifier.

Remove one session with:

```bash
cpak session disable com.example.desktop
```

Removing the last installed package version which provides that identifier also unregisters it. `cpak system remove` removes registered cpak sessions before deleting the system authority.

## Display manager support

cpak stores login entries in `/usr/local/share/wayland-sessions`, the local system data directory defined by the XDG base directory specification. `cpak system setup` configures display managers which do not search that directory by default.

| Display manager | Status                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ |
| GDM             | Works without extra configuration. GDM reads Wayland sessions from the XDG system data directories.                      |
| SDDM            | Configured automatically by `cpak system setup`.                                                                         |
| LightDM         | Configured automatically by `cpak system setup`. Existing system, X11, and Wayland session directories remain available. |
| greetd          | Supported through the selected greeter. Configure the greeter to scan `/usr/local/share/wayland-sessions`.               |

For example, tuigreet accepts the cpak directory through its existing session option:

```bash
tuigreet --sessions /usr/local/share/wayland-sessions:/usr/share/wayland-sessions
```

Other display managers can use the generated entries when they scan XDG system data directories or allow `/usr/local/share/wayland-sessions` to be added to their session path.
