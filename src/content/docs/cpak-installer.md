---
title: cpak-installer
description: Install a Store application with the signed graphical or terminal installer, or add installer downloads to a package page.
tags: [installer, store, security, publishing]
section: start
order: 15
---

# cpak-installer

cpak-installer is a signed executable for one Store application. It contains matching `cpak` and `cpak-storaged` binaries plus verified package metadata. At installation time it resolves the manifest, OCI image, dependencies, permissions, and desktop exports.

## For users

Open an application in the [cpak Store](/store) and select **Download installer**. The Store chooses the current architecture when possible. The menu beside the button also provides the equivalent terminal command and a direct installer URL.

Browsers normally save the file without the executable bit. Enable execution in the file properties or run:

```bash
chmod +x Application-amd64.cpak-installer
./Application-amd64.cpak-installer
```

Opening the file from an X11 or XWayland desktop shows the application name, original icon, description, source, requested permissions, installation progress, and final result. Starting the same file from a terminal shows a text confirmation and reports progress there. Use `--terminal` to request the terminal interface explicitly.

The installer places or updates `cpak` and `cpak-storaged` in `~/.local/bin`, then installs the selected package from its pinned Git revision. Matching runtime binaries are reused.

Inspect the verified metadata without installing anything:

```bash
./Application-amd64.cpak-installer --inspect
```

The command prints the package origin, display metadata, architecture, source reference, requested permissions, and installer digest.

## What the download verifies

Each capsule carries metadata signed with Ed25519. The signature covers:

- the package origin and immutable Git reference
- the application name, description, icon, and requested permissions
- the target architecture
- the SHA-256 digest of the complete installer base

cpak-installer verifies the signature, metadata schema, architecture, and complete base digest before showing the interface or writing a file. Changing the application identity, source reference, permissions, embedded runtime binaries, or installer code invalidates the capsule.

Each runtime binary is written through a temporary file and renamed into place only after the write succeeds. Package installation then follows the same manifest validation and transaction path as `cpak install`.

## For package developers

Publish a valid package repository and its OCI images, then add the reviewed entry to [Containerpak/store](https://github.com/Containerpak/store). The cpak release workflow produces one installer base for each supported architecture and a signed catalog describing each listed package.

The Store assembles a download when this endpoint is requested:

```text
https://cpak.it/install/github.com/OWNER/REPOSITORY?arch=amd64
```

Use `arch=arm64` for ARM64. The endpoint loads the installer base and catalog from the configured cpak release, verifies the base digest against the catalog, appends the package metadata and signature, and returns the result as `application/vnd.cpak.installer`.

The requested Store origin and signed release catalog are the exclusive package identity inputs. One installer base serves every listed package.

Link to the endpoint for a direct graphical installation path. Publish the terminal command beside it:

```bash
cpak install github.com/OWNER/REPOSITORY
```

The Store application page publishes both forms in its download menu. Installer bases and package metadata are produced by the cpak release workflow.

## Release ownership

Versioned cpak releases publish these assets for `amd64` and `arm64`:

```text
cpak-linux-ARCH
cpak-storaged-linux-ARCH
cpak-installer-linux-ARCH
cpak-installer-catalog.json
SHA256SUMS
```

The generic installer base contains the installer interface and both runtime binaries from the same release. The catalog contains signed package metadata and the expected base digest. cpak.it combines these verified artifacts after checking the base digest.

See [Release channels](/docs/release-channels) for version selection, [Publish to the Store](/docs/publishing) for catalog requirements, and [Security reporting](/docs/security) for private vulnerability reports.
