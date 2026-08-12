---
title: Permissions
description: Declare the smallest host access an application needs and understand user overrides.
tags: [manifest, security, permissions]
section: packages
order: 30
---

# Permissions

The `override` object in `cpak.json` is the package's default permission set. The name reflects the same structure used for local user overrides. Each field maps to a concrete runtime action.

## Display and desktop sockets

| Field              | Access                                                                |
| ------------------ | --------------------------------------------------------------------- |
| `socketWayland`    | The active Wayland display socket.                                    |
| `socketX11`        | The host X11 socket directory.                                        |
| `socketPulseAudio` | The PulseAudio-compatible audio socket.                               |
| `socketSessionBus` | The desktop session D-Bus socket.                                     |
| `socketSystemBus`  | The system D-Bus socket. Use only when direct bus access is required. |
| `socketCups`       | The CUPS printing socket.                                             |
| `socketAtSpiBus`   | The accessibility bus socket.                                         |
| `socketSshAgent`   | The user's SSH agent socket.                                          |
| `socketGpgAgent`   | The user's GPG agent socket.                                          |
| `socketBluetooth`  | The Bluetooth socket.                                                 |

Use the system broker for notifications and external URIs. Each permission exposes one operation to the package.

## Devices

`deviceDri` grants access to graphics devices under `/dev/dri`. Other booleans cover KVM, shared memory, ALSA, video capture, FUSE, TUN/TAP, and USB. `deviceAll` exposes all host devices and should be reserved for packages that cannot work with narrower grants.

NVIDIA userspace libraries are resolved from the host at launch when GPU passthrough is active. Packages should not copy a host-specific NVIDIA driver into their image.

## Filesystem

Manifest v2 uses structured filesystem entries:

```json
"filesystem": [
  { "path": "home", "access": "read-write" },
  { "path": "/mnt/projects", "access": "read-only" }
]
```

The portable `home` scope maps to the user's home directory. The `host` scope maps to the host root. Absolute paths select one explicit location. Access must be `read-only` or `read-write`.

Avoid the legacy `fsHost`, `fsHostHome`, `fsHostEtc`, and `fsExtra` fields in new packages. They exist for v1 migration and are rejected by the strict v2 schema.

## Network and processes

`network` controls network access in the package namespace. `process` shares the host process namespace and should remain false unless the application must inspect host processes.

`userNamespaces` permits the application to create another user namespace. Browsers and tools with their own sandbox commonly need it. Leaving it false blocks nested user namespaces inside the package.

## Resource limits

| Field         | Unit               | Zero means         |
| ------------- | ------------------ | ------------------ |
| `memoryMaxMB` | MiB                | no limit requested |
| `cpuQuota`    | percent of one CPU | no limit requested |
| `pidsMax`     | process count      | no limit requested |

Limits use delegated cgroup v2 controllers. A requested limit fails when the current host cannot enforce it.

## System operations

Set `notification` to expose the notification shim and `openURI` to allow opening an external URI on the host. `openURI` covers `xdg-open`, `gio open`, and direct GIO default-handler requests. Both operations pass through typed system broker requests.

Set `hostApplications` when a desktop environment needs the host application catalog. Launch requests use opaque catalog identifiers and the broker selects the trusted desktop entry.

`hostActions` grants capabilities from a built-in provider. The `containers` provider offers `read`, `manage-owned`, and `exec-owned`. Package updates treat a new provider or capability as a permission addition. See [Host actions](/docs/host-actions) for the exact boundary.

## Environment

The `env` array accepts `NAME=value` entries. Use it for stable package defaults, not user secrets. Secrets should enter through the application's own supported mechanism or a user-controlled mount.

## Local overrides

Users can replace one permission key for an installed application:

```bash
cpak override github.com/example/app --key network --value false
cpak override github.com/example/app --key filesystem --value '[{"path":"home","access":"read-only"}]'
```

Overrides are stored per application version. Review them after a major package change. `cpak update` reports permission additions before committing the new version.

> [!WARNING] Broad access
> `deviceAll`, `socketSystemBus`, `process`, `asRoot`, and `host` filesystem access cross large parts of the sandbox boundary. Document why a package needs them.
