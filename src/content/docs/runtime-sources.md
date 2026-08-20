---
title: Runtime sources
description: Add verified tar, Debian, or RPM artifacts to a package at installation time.
tags: [manifest, packages, runtime]
section: packages
order: 45
---

# Runtime sources

Most package files belong in the OCI image. A runtime source covers the smaller
set of files that must come from a separate HTTPS artifact, such as vendor
integration files or a native package published independently from the image.

cpak downloads each source during installation, verifies its declared size and
SHA-256, then installs it into a managed layer. The layer follows the package
through updates, rollback, audit, and removal.

## Manifest entry

Each source declares one installer:

```json
"runtime_sources": [
  {
    "name": "desktop-integration-1.0.0.tar.gz",
    "url": "https://downloads.example.org/desktop-integration-1.0.0.tar.gz",
    "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "size": 4096,
    "installer": "tar"
  }
]
```

`name` is optional and must be a plain file name. Without it, cpak uses the file
name from the URL. The URL must use HTTPS and may not redirect to an insecure
download.

## Installers

| Installer     | Accepted artifact                | Requirement in the package environment |
| ------------- | -------------------------------- | -------------------------------------- |
| `tar`         | Uncompressed or gzip tar archive | None                                   |
| `dpkg`        | Debian package                   | `/usr/bin/dpkg`                        |
| `deb-extract` | Debian package                   | `/usr/bin/dpkg-deb`                    |
| `rpm`         | RPM package                      | `/usr/bin/rpm`                         |

The native installers run inside the package root, so their dependencies and
scripts see the same filesystem that will become the managed layer. Choose an
installer that exists in the selected platform image.

`dpkg` checks package dependencies and runs maintainer scripts. `deb-extract`
only unpacks the Debian data archive. It is intended for packages whose declared
dependency names no longer match the platform even though the required ABI is
present. It does not run `preinst`, `postinst`, `prerm`, or `postrm`.

The `tar` installer writes archive paths relative to `/` in the package. A file
stored as `usr/share/applications/example.desktop` becomes
`/usr/share/applications/example.desktop`. Absolute paths, parent traversal,
links outside the package root, and device entries are rejected.

## When to use one

Keep normal application files in the OCI build. This gives registries and cpak
stable layers to cache and deduplicate. Use a runtime source when the separate
artifact is part of the package contract and cannot sensibly be copied into the
published image.

This also covers software whose license does not allow a third party to publish
the application payload. The OCI image can contain the redistributable runtime,
wrapper, and desktop integration while `runtime_sources` points to the official
vendor download. The user's cpak installation downloads the pinned artifact
from that origin and builds the managed layer locally.

Do not use runtime sources as an unchecked download step. Pin the exact size and
SHA-256 in `cpak.json`, publish immutable artifact URLs, and regenerate the lock
file when the source changes.

## Verify a source

Build or download the artifact in CI, then compare it with the manifest before
publishing:

```bash
test "$(sha256sum desktop-integration-1.0.0.tar.gz | cut -d' ' -f1)" = \
  "$(jq -r '.runtime_sources[0].sha256' cpak.json)"
test "$(stat -c '%s' desktop-integration-1.0.0.tar.gz)" = \
  "$(jq -r '.runtime_sources[0].size' cpak.json)"
cpak validate cpak.json
```

An install stops before changing the active package when the download, size,
checksum, installer, or archive layout is invalid.
