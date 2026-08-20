---
title: Manifest v2 reference
description: Every top-level field in cpak.json, with strict validation and portable examples.
tags: [manifest, reference]
section: packages
order: 20
---

# Manifest v2 reference

Manifest v2 is a strict JSON contract. Add the schema URL to receive editor completion and validation from the versioned definition in the cpak repository.

```json
{
  "$schema": "https://raw.githubusercontent.com/Containerpak/cpak/v2/schema/manifest-v2.json",
  "manifest_version": "2.0",
  "name": "Example",
  "description": "Example desktop application.",
  "version": "1.0.0",
  "image": "ghcr.io/example/example:main",
  "binaries": ["/usr/bin/example"],
  "desktop_entries": ["/usr/share/applications/example.desktop"],
  "dependencies": [],
  "addons": [],
  "idle_time": 0,
  "override": {
    "socketWayland": true,
    "socketX11": true,
    "deviceDri": true,
    "filesystem": [{ "path": "home", "access": "read-write" }],
    "network": true
  }
}
```

## Package fields

| Field              | Required | Meaning                                                          |
| ------------------ | -------- | ---------------------------------------------------------------- |
| `$schema`          | No       | JSON Schema URI used by editors.                                 |
| `manifest_version` | Yes      | Must be `2.0`.                                                   |
| `name`             | Yes      | Human-readable application name.                                 |
| `description`      | Yes      | Short package description.                                       |
| `version`          | No       | Application version shown by cpak.                               |
| `image`            | Yes      | OCI image reference or digest.                                   |
| `binaries`         | Yes      | One or more absolute executable paths.                           |
| `desktop_entries`  | No       | Absolute paths to `.desktop` files in the image.                 |
| `sessions`         | No       | Desktop or kiosk sessions offered to a display manager.          |
| `dependencies`     | No       | Required cpak package origins.                                   |
| `addons`           | No       | Optional addon origins supported by this package.                |
| `addon_provider`   | No       | Capability and runtime exports supplied when used as an addon.   |
| `idle_time`        | Yes      | Minutes before an idle container stops. Zero disables the timer. |
| `override`         | Yes      | Default host permissions and resource limits.                    |
| `runtime_sources`  | No       | Verified HTTPS artifacts installed into a managed layer.         |

Unknown top-level and nested fields fail validation.

## Dependencies

Each dependency needs an origin. A branch, release, or commit can select its source reference.

```json
"dependencies": [
  {
    "origin": "github.com/containerpak/umu",
    "branch": "main"
  }
]
```

Use only one source selector per dependency. The lock file records the resolved dependency manifest, its hash, and immutable OCI image digest.

## Addons

The `addons` array lists package origins that can join this application. Enabled addons use the parent's effective host permissions.

```json
"addons": [
  "github.com/containerpak/sdk-go",
  "github.com/containerpak/sdk-node-lts"
]
```

An addon can declare a named provider slot and the paths it adds to its parent:

```json
"addon_provider": {
  "id": "go",
  "slot": "sdk.go",
  "mode": "exclusive",
  "exports": {
    "path": ["/usr/local/go/bin"],
    "environment": ["GOROOT=/usr/local/go"]
  }
}
```

`exclusive` permits one active provider in a slot. `multiple` composes every
available provider. See [Dependencies and addons](/docs/dependencies-addons) for
provider selection and every supported export.

## Runtime sources

A runtime source downloads an external HTTPS artifact at installation time and installs it into a managed layer.

```json
"runtime_sources": [
  {
    "name": "example.deb",
    "url": "https://downloads.example.org/example.deb",
    "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "size": 1048576,
    "installer": "dpkg"
  }
]
```

The URL must use HTTPS. cpak verifies the declared byte size and SHA-256 before running the installer. A mismatch aborts installation.

Set `installer` to `dpkg`, `deb-extract`, `rpm`, or `tar`. `dpkg` checks package
dependencies and runs maintainer scripts, while `deb-extract` only unpacks the
Debian data archive. The tar installer accepts plain and gzip-compressed tar
archives. Read [Runtime sources](/docs/runtime-sources) for the package
requirements, archive layout, and CI checks.

## Permissions

The `override` object declares the package defaults for sockets, devices, filesystem paths, file chooser operations, networking, process sharing, nested user namespaces, resource limits, and system broker actions. See [Permissions](/docs/permissions) for every field and its effect.

### File chooser policy

`filePicker` grants operations, not host paths. Each field is disabled by default:

```json
"filePicker": {
  "openFile": true,
  "openFolder": false,
  "saveFile": true,
  "persistent": false,
  "containingFolder": false
}
```

`openFile`, `openFolder`, and `saveFile` enable their matching chooser modes. `persistent` lets the confirmation offer a grant that survives the current environment. `containingFolder` lets a file request offer its parent directory as context. The user still approves the selected object and every wider or longer grant.

Use `filesystem` for paths that must always exist inside the package. Use `filePicker` when access begins with an interactive user selection. See [File chooser access](/docs/file-access) for guest paths and revocation.

## Login sessions

The optional `sessions` array turns an exported binary into a desktop or kiosk choice at the system login screen. Each session has its own permission set. Registration is explicit and passes through the cpak system authority. See [Desktop and kiosk sessions](/docs/desktop-sessions).

## Validate and migrate

```bash
cpak validate cpak.json
cpak gen-schema --output manifest-v2.json
cpak migrate-manifest old-cpak.json --output cpak.json
```

Migration converts supported v1 fields to their v2 representation. Review the result and run `cpak validate`; legacy broad filesystem flags should be replaced by explicit `filesystem` entries.
