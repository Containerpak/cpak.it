---
title: System integration
description: Connect desktop applications to display, audio, notifications, URIs, devices, and selected host commands.
tags: [desktop, broker, hrun]
section: runtime
order: 30
---

# System integration

Cpak supports existing Linux applications without requiring them to adopt a package-format-specific API. The manifest decides which host resources and operations are available.

## Display and input

Wayland packages receive the active Wayland socket when `socketWayland` is enabled. X11 packages receive `/tmp/.X11-unix` when `socketX11` is enabled. GPU rendering normally also needs `deviceDri`.

The runtime carries the display environment needed to address the mounted socket. Test both display paths when a package advertises both.

## Audio and accessibility

`socketPulseAudio` exposes the PulseAudio-compatible socket used by PulseAudio and PipeWire desktop sessions. Direct ALSA devices require `deviceAlsa`.

Accessibility clients use `socketAtSpiBus`. Printing uses `socketCups`. Agent sockets for SSH and GPG are separate grants because they can authorize actions as the user.

## Notifications

Set the broker permission in `cpak.json`:

```json
"notification": true
```

Cpak mounts its notification compatibility command into the package. A request reaches the local system broker, which verifies the package instance and policy before sending the desktop notification.

The host session bus is not required for this operation.

## External URIs

Enable the URI broker when links must open in a host application:

```json
"openURI": true
```

The package invokes the provided compatibility path. Cpak validates the request and forwards the URI through the host desktop. Keep user-controlled URI validation in the application as well.

## Host commands

Some applications must call a host tool that cannot be represented as a mounted resource. List the accepted command names:

```json
"allowedHostCommands": [
  "example-tool"
]
```

The hrun bridge resolves the host executable, verifies the requesting peer, and passes arguments without a shell. Paths not listed by policy are rejected.

Use this only when a brokered operation or package dependency cannot model the requirement. A host command executes with the user's host context.

## Desktop entries and icons

Declare every desktop entry that should appear on the host. The entry and referenced icons must exist in the final OCI image. Cpak exports a host-facing launcher that re-enters the package through its installed origin.

An update refreshes exported metadata even when the OCI image digest did not change. This keeps manifest and desktop changes in sync with the installed package record.

## Package identity

Cpak exposes its own package identity to applications. Use it to select the correct storage and integration behavior when the application already supports several distribution formats. Do not set unrelated `FLATPAK_*` variables inside a Cpak package.
