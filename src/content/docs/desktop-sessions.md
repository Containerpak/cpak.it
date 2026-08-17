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

On a host whose `/usr/local` is read-only, which is the normal shape of an image based distribution, cpak installs under the first prefix that accepts a privileged write: `/usr/local`, then `/opt/cpak`, then `/var/lib/cpak`. The rest of the integration follows the chosen prefix. The bus policy declares the relocated service directory so activation still resolves, and the Polkit action is written to `/etc/polkit-1/actions`, one of the directories polkitd scans. `cpak system status` reports the installation wherever it landed.

## Transports

The authority answers on the system bus and on a Unix socket at `/run/cpak/authority.sock`. The bus is used whenever it exists, because it is what carries an interactive Polkit authorization. The socket exists for hosts that run no system bus. It identifies the caller from the credentials the kernel attaches to the connection rather than from a bus name, and it accepts session changes only from root, since an unprivileged request has no way to be authorized without Polkit.

You never run the whole command as an administrator, and cpak refuses it if you try: the package store belongs to your user, and root would look for the package inside its own. Run it as yourself:

```bash
cpak session enable github.com/example/desktop com.example.desktop
```

When no transport can carry the request, which is the normal situation on a server with no bus, cpak escalates the one step that needs privilege and leaves the rest running as you. It uses what the host actually provides: `pkexec` or `run0` in a graphical session, `sudo` or `doas` on a terminal. If the host has none of them, cpak says so instead of guessing, and the step can be run directly as root.

## Register a session

```bash
cpak session list github.com/example/desktop
cpak session enable github.com/example/desktop com.example.desktop
```

cpak shows the session permissions before registration. Polkit then asks for authorization. The privileged service accepts validated metadata and a package origin. The generated display manager entry calls the fixed cpak launcher with the registered session identifier.

Remove one session with:

```bash
cpak session disable com.example.desktop
```

Removing the last installed package version which provides that identifier also unregisters it. `cpak system remove` removes registered cpak sessions before deleting the system authority.

## Display manager support

cpak stores login entries under the prefix it installed into, which is `/usr/local/share/wayland-sessions` on a normal host and moves with the prefix on a read-only one. `cpak system setup` then points the installed display managers at that directory.

| Display manager | Status                                                                                                                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SDDM            | Configured automatically. The generated search path keeps the standard session directories, so the sessions the distribution ships stay listed beside the cpak ones.                         |
| LightDM         | Configured automatically. Existing system, X11, and Wayland session directories remain available.                                                                                            |
| GDM             | A standard install needs nothing: GDM reads the XDG system data directories. A relocated directory is published through the service environment, since GDM has no session directory setting. |
| greetd          | greetd has no session concept of its own, so the greeter enumerates the sessions. cpak publishes the directory through the service environment as it does for GDM.                           |

The environment based path is applied automatically under systemd, through a drop-in that sorts last and preserves the value another drop-in already set, and under OpenRC, through a marked block in the service configuration file. Under runit, s6, dinit, and sysvinit the packaged service scripts read no environment file of their own, so writing one would produce a file nothing loads. There `cpak system setup` reports the directory to add and to which service, and leaves the host alone.

A greeter that sets `XDG_DATA_DIRS` itself overrides what the service environment provides, so the directory has to be listed in the greeter as well. Greeters with an explicit session option accept it directly:

```bash
tuigreet --sessions /usr/local/share/wayland-sessions:/usr/share/wayland-sessions
```
