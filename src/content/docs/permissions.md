---
title: Permissions
description: Declare the smallest host access an application needs and understand user overrides.
tags: [manifest, security, permissions]
section: packages
order: 30
---

# Permissions

The `override` object in `cpak.json` is the package's default permission set. The name reflects the same structure used for local user overrides. Each field maps to a concrete runtime action.

A permission a manifest does not declare is not granted. There is no field that is on unless you turn it off, so a package reaches the display, the session bus, audio, the GPU or the network only by asking for each of them by name. `cpak init` writes every field out explicitly, which is the recommended shape for a manifest: it says what the package needs and, just as usefully, what it does not.

## Display and desktop sockets

| Field              | Access                                  |
| ------------------ | --------------------------------------- |
| `socketWayland`    | The active Wayland display socket.      |
| `socketPulseAudio` | The PulseAudio-compatible audio socket. |
| `socketCups`       | The CUPS printing socket.               |
| `socketSshAgent`   | The user's SSH agent socket.            |
| `socketGpgAgent`   | The user's GPG agent socket.            |

Use the system broker for notifications and external URIs. Each permission exposes one operation to the package.

## Devices

`deviceDri` grants access to graphics devices under `/dev/dri`. Other booleans cover KVM, shared memory, ALSA, video capture, FUSE, TUN/TAP, and USB. `deviceAll` exposes all host devices and should be reserved for packages that cannot work with narrower grants.

`deviceSerial` covers `/dev/ttyUSB*` and `/dev/ttyACM*`, which is how boards, printers, radios and meters appear. Use it instead of `deviceAll` for anything that talks to a serial port. Device globs are resolved when the container is built, so a port plugged in afterwards is not visible to a running application.

NVIDIA userspace libraries are resolved from the host at launch when GPU passthrough is active. Package images use that resolved driver stack.

## Filesystem

Manifest v3 uses structured filesystem entries:

```json
"filesystem": [
  { "path": "home", "access": "read-write" },
  { "path": "/mnt/projects", "access": "read-only" }
]
```

The portable `home` scope maps to the user's home directory. The `host` scope maps to the host root. Absolute paths select one explicit location. Access must be `read-only` or `read-write`.

The legacy `fsHost`, `fsHostHome`, `fsHostEtc`, and `fsExtra` fields are rejected by the strict v3 schema.

## Displays and Bluetooth

`socketWayland` mounts the active Wayland display. `displayX11` starts a nested
X11 display for one container. On a Wayland desktop cpak uses Xwayland with a
private socket. On an X11 desktop it uses Xephyr. The package does not receive
the host X11 display or its authority file.

`bluetooth` exposes the general BlueZ API through a private proxy. Discovery,
pairing, GATT applications, agents, profiles, signals and file descriptor
passing use this path. Calls to any other system bus service are denied, and
raw HCI access is not included.

## Session bus

`sessionBus` grants exact calls on the desktop session bus. Each `talk` entry names one destination, object path, interface, and list of methods. The optional `own` list names the well-known bus names the package may claim.

Raw X11, session bus, system bus, AT-SPI, and Bluetooth socket fields are not available in manifest v3. Use `displayX11` for isolated X11 compatibility and `bluetooth` for the filtered BlueZ service. Typed broker permissions cover notifications, external URIs, file selection, and host application launch. cpak has no raw system bus permission.

## User-selected files

`filePicker` permits native open, folder, and save requests without mounting the host home. Exact file access is read-only. A package can offer the containing folder as an explicit user choice and can allow grants to persist across launches. See [File chooser access](/docs/file-access) for the policy fields, runtime paths, and revocation commands.

## Network and processes

`network` controls network access in the package namespace. `process` shares the host process namespace and should remain false unless the application must inspect host processes.

`userNamespaces` permits the application to create another user namespace and perform the mount setup required by nested sandboxes such as bubblewrap. Landlock cannot coexist with that mount setup, so enabling this permission disables Landlock for the application. The cpak mount namespace still controls which host paths exist and whether each mount is read-only or writable, and the remaining seccomp policy stays active. Leaving it false blocks nested user namespaces and mounts inside the package.

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

`hostActions` grants capabilities from a built-in provider. The `containers` provider offers `read`, `manage-owned`, and `exec-owned`; the `cpak` provider offers `read`, `manage`, and `exec` for bounded package discovery and persistent environment operations. Package updates treat a new provider or capability as a permission addition. See [Host actions](/docs/host-actions) for the exact command boundary.

## Environment

The `env` array accepts `NAME=value` entries. Use it for stable package defaults, not user secrets. Secrets should enter through the application's own supported mechanism or a user-controlled mount.

## Local overrides

Users can replace one permission key for an installed application:

```bash
cpak override github.com/example/app --key network --value false
cpak override github.com/example/app --key filesystem --value '[{"path":"home","access":"read-only"}]'
cpak override github.com/example/app --key filePicker --value '{"openFile":true}'
```

Overrides are stored per application version. Review them after a major package change. `cpak update` reports permission additions before committing the new version.

A local override replaces the manifest defaults and may either remove or add access. On a managed machine the system ceiling is applied afterwards, so no user override can exceed the maximum selected by the administrator. See [Managed deployment](/docs/managed-deployment).

> [!WARNING] Broad access
> `deviceAll`, `process`, `asRoot`, broad session bus rules, and `host` filesystem access cross large parts of the sandbox boundary. Document why a package needs them.
