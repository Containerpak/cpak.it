---
title: System integration
description: Connect applications to display, audio, notifications, URIs, host applications, and typed host services.
tags: [desktop, broker, actions]
section: runtime
order: 30
---

# System integration

cpak supports existing Linux applications without requiring them to adopt a package-format-specific API. The manifest decides which host resources and operations are available.

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

cpak mounts its notification compatibility command into the package. A request reaches the local system broker, which verifies the package instance and policy before sending the desktop notification.

The host session bus is not required for this operation.

## External URIs

Enable the URI broker when links must open in a host application:

```json
"openURI": true
```

The package invokes the provided compatibility path. cpak validates the request and forwards the URI through the host desktop. Keep user-controlled URI validation in the application as well.

## Host applications

Desktop cpaks can list applications installed by the host and launch a selected entry through the broker:

```json
"hostApplications": true
```

cpak builds a private catalog from trusted desktop entries. The package receives opaque application identifiers instead of executable paths. Launch requests are resolved against that catalog and can target the nested display of a desktop cpak.

## Typed host services

Use `hostActions` when an application needs a supported host service which cannot be represented by a mount. Each provider publishes a fixed capability set. See [Host actions](/docs/host-actions) for the container provider and its compatibility shims.

`allowedHostCommands` is accepted only to migrate the old notification, URI, and host application shims. New manifests cannot use it to name arbitrary executables.

## Desktop entries and icons

Declare every desktop entry that should appear on the host. The entry and referenced icons must exist in the final OCI image. cpak exports a host-facing launcher that re-enters the package through its installed origin.

An update refreshes exported metadata even when the OCI image digest did not change. This keeps manifest and desktop changes in sync with the installed package record.

## Package identity

cpak exposes its own package identity to applications. Use it to select the correct storage and integration behavior when the application already supports several distribution formats. Do not set unrelated `FLATPAK_*` variables inside a cpak package.
