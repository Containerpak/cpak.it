---
title: System integration
description: Connect applications to display, audio, notifications, URIs, host applications, and typed host services.
tags: [desktop, broker, actions]
section: runtime
order: 30
---

# System integration

The manifest controls display, audio, devices, desktop services, and broker operations available to an application.

## Display and input

Wayland packages receive the active Wayland socket when `socketWayland` is enabled. GPU rendering normally also needs `deviceDri`. Set `displayX11` when the application needs X11 compatibility. cpak starts a nested Xwayland or Xephyr display and mounts only its private socket and authority file. The host X11 display remains outside the package.

On an X11 desktop, cpak also mediates declared clipboard directions, mirrors the application title, icon and fullscreen state to Xephyr, and follows host window resizes. Closing the last application window stops the cpak instance. The broker is part of cpak and does not use D-Bus or require a helper inside the package image.

The runtime carries the display environment needed to address the mounted socket.

## Audio and accessibility

`socketPulseAudio` exposes the PulseAudio-compatible socket used by PulseAudio and PipeWire desktop sessions. Direct ALSA devices require `deviceAlsa`.

Printing uses `socketCups`. Agent sockets for SSH and GPG are separate grants because they can authorize actions as the user. Manifest v3 does not mount a raw accessibility bus socket.

## Bluetooth

Set `bluetooth` when the application needs the BlueZ API:

```json
"bluetooth": true
```

cpak mounts a private bus socket at the conventional system bus path so normal
BlueZ clients work without application changes. The native proxy permits only
`org.bluez`, including exported agents and profiles, signals and file
descriptors. It denies bus enumeration and every unrelated system service.
The permission does not grant raw HCI sockets or Bluetooth device nodes.

## Notifications

Set the broker permission in `cpak.json`:

```json
"notification": true
```

cpak mounts its notification compatibility command into the package. A request reaches the local system broker, which verifies the package instance and policy before sending the desktop notification.

The broker owns the session bus interaction for this operation.

## External URIs

Enable the URI broker when links must open in a host application:

```json
"openURI": true
```

cpak provides compatible `xdg-open` and `gio open` commands. Applications that call GIO directly resolve a private URI handler inside the package. The handler reaches the broker through the existing GIO interface, and the broker asks the host desktop to open the URI with its current default application.

HTTP, HTTPS, and mail links use this path automatically. The broker rejects file paths, `file:` URIs, script schemes, and custom outbound schemes. Keep application-side validation for user-controlled URIs.

## Default applications and URI callbacks

An exported desktop entry keeps its declared MIME types and URI schemes. cpak also exports a hidden compatibility ID when the original desktop ID is free on the host. This allows a packaged browser, mail client, or another handler to become the desktop default while the visible launcher keeps its collision-safe cpak ID.

Compatibility entry ownership is limited to the package identity that created it. User-created and system desktop entries remain independent. Removing the package removes its owned entries.

URI callbacks follow the opposite path. The host desktop starts the exported entry with `%u` or `%U`, and cpak forwards the URI to the declared application command. Loopback callbacks, such as an OAuth response on `127.0.0.1`, use the package network namespace selected by its manifest.

## Native file choosers

`filePicker` lets an application request files, folders, and save destinations without a permanent home mount. GTK and GIO calls use a restricted desktop-bus adapter that handles the file chooser protocol without a general session bus grant. The proxy rejects unrelated destinations unless an exact `sessionBus` rule allows them.

The host presents the chooser and cpak attaches the accepted object to the package namespace. Scope and lifetime confirmations use the configured desktop dialog backend. See [File chooser access](/docs/file-access) for package policy and [Desktop dialog adapters](/docs/desktop-dialogs) for distribution configuration.

## Host applications

Desktop cpaks can list applications installed by the host and launch a selected entry through the broker:

```json
"hostApplications": true
```

cpak builds a private catalog from trusted desktop entries and gives the package opaque application identifiers. Launch requests resolve those identifiers against the catalog and can target the nested display of a desktop cpak.

## Typed host services

Use `hostActions` for supported host services represented by broker capabilities. The `containers` provider exposes a restricted Podman or Docker interface. The `cpak` provider exposes bounded discovery and persistent environment operations through `cpak-host`. See [Host actions](/docs/host-actions) for both capability sets and their accepted commands.

During v1 migration, `allowedHostCommands` maps the old notification, URI, and host application shims to typed permissions. New manifests declare the typed permissions directly.

## Desktop entries and icons

Declare every desktop entry that should appear on the host. The entry and referenced icons must exist in the final OCI image. cpak exports a host-facing launcher that re-enters the package through its installed origin.

An update refreshes exported metadata even when the package is current or the OCI image digest did not change. This repairs missing launchers and keeps manifest and desktop changes in sync with the installed package record.

## Runtime detection

cpak sets `CPAK_CONTAINER_ID` to an opaque identifier for the active runtime instance. Applications can test its presence to select cpak storage and integration behavior. The value can change between instances and must not be parsed or stored as a package identifier.
