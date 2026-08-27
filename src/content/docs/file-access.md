---
title: File chooser access
description: Grant selected files and folders without exposing the host home.
tags: [permissions, files, desktop]
section: runtime
order: 30
---

# File chooser access

A cpak application has a private persistent home unless its manifest explicitly mounts the host home. The file chooser permission lets the user bring individual host files or folders into that environment when they are needed.

The application opens its usual native file chooser. cpak handles the request on the host, applies the package policy, and mounts each accepted selection below `/run/cpak/grants`. The path returned to the application always points to that private grant tree.

Some desktop choosers can present the scope and lifetime choices themselves. When they cannot, cpak uses the configured desktop dialog adapter and falls back to its built-in dialog. Closing or denying that second dialog cancels the request.

A selection already covered by the package's `filesystem` entries keeps its normal path and needs no second confirmation. The built-in dialog follows the host light or dark preference and the standard freedesktop accent color, including custom accents published by the desktop.

## Manifest policy

Enable only the operations used by the application:

```json
"filePicker": {
  "openFile": true,
  "openFolder": true,
  "saveFile": true,
  "persistent": true,
  "containingFolder": true
}
```

| Field              | Effect                                                             |
| ------------------ | ------------------------------------------------------------------ |
| `openFile`         | Select one or more existing files.                                 |
| `openFolder`       | Select an existing folder.                                         |
| `saveFile`         | Select a writable destination for a new file.                      |
| `persistent`       | Offer access that can be restored on later launches.               |
| `containingFolder` | Offer the selected file's containing folder as additional context. |

Selecting a file grants that file read-only by default. Containing-folder access is a separate user decision and appears only when the manifest permits it. It is useful for executables that load files beside themselves, while documents and uploads can remain isolated to one file.

A folder selection grants the chosen folder read-only. A save request grants its parent directory read-write so the application can create the selected name and complete an atomic save.

Use a portable home subpath when the package always needs one application directory but should not receive the complete host home:

```json
"filesystem": [
  {"path": "home/.local/share/example", "access": "read-write"}
]
```

Selections inside that directory keep their normal path and skip the cpak confirmation. Files selected elsewhere use a dynamic grant.

## Lifetime

A session grant belongs to the current application environment and disappears when it stops. A persistent grant is stored for that package, mounted again at launch, and remains visible until the user revokes it.

The graphical manager lists persistent grants and stops a running application after revocation so the old mount cannot remain active:

```sh
cpak grant manage github.com/example/app
```

The same operations are available to scripts:

```sh
cpak grant list github.com/example/app
cpak grant list github.com/example/app --json
cpak grant revoke github.com/example/app GRANT_ID
```

An ID prefix is accepted when it identifies one grant.

## Request flow

One request crosses the package boundary through a fixed sequence:

1. The manifest is checked for the requested open, folder, or save capability.
2. The host chooser returns one or more local file paths.
3. cpak asks for any optional parent-folder or persistent access not collected by the chooser.
4. The broker resolves and opens each selected object on the host.
5. The active mount namespace receives a restricted mount and the application receives its guest path.

The broker accepts at most 128 paths and rejects remote URIs, malformed filters, invalid save names, and selections that change type while being opened. A regular file and a directory produce different descriptor sets so the mount worker can verify the expected object before attaching it.

The result path is stable for the grant identity. A single file normally appears at `/run/cpak/grants/GRANT_ID/FILE_NAME`. A containing-folder grant mounts the directory and returns the selected child below it. Applications should use the returned path instead of constructing a path inside the grant tree.

## Application integration

GTK applications can keep their normal file chooser. cpak places a desktop-bus adapter in the application environment and intercepts file chooser requests before forwarding any session-bus access allowed by the manifest. Without the general session-bus permission, the adapter rejects unrelated destinations.

Applications that need a direct integration can use the installed shim:

```sh
cpak-file-picker open-file \
  --title "Select an executable" \
  --accept-label "Run" \
  --filter "Windows executables|*.exe;*.msi"
```

Use `--multiple` for several files, `open-folder` for a directory, or `save-file --suggested-name report.pdf` for a destination. A successful command prints guest paths, one per line.

The broker carries structured requests over a private Unix socket. Selected objects are passed to the running mount namespace through file descriptors, so the mount remains attached to the object approved by the user even if its host path changes. The desktop adapter may use the services available in the current session, but the grant protocol and headless runtime do not depend on D-Bus.

The restricted desktop-bus adapter forwards only calls accepted by the manifest's `sessionBus` policy. File chooser calls remain available with `filePicker` alone. This gives GTK and GIO applications their expected API without exposing unrelated bus services.

Runtime confirmations use the backend selected by the user or distribution. See [Desktop dialog adapters](/docs/desktop-dialogs) for automatic desktop matching, configuration files, build tags, and external helper locations.

## Headless environments

An interactive request fails closed when no supported desktop chooser is available. Persistent grants can still be listed and revoked from the CLI. A server workflow should declare a narrow filesystem path in the manifest or use a pre-established persistent grant instead of trying to open a graphical chooser.

Cancellation is also closed by default. Closing the chooser, denying the cpak confirmation, receiving a malformed adapter response, or losing the broker connection returns no new mount to the application.
