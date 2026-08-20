---
title: SDKs and development tools
description: Package language toolchains as optional editor addons.
tags: [sdk, addons, development]
section: packages
order: 60
---

# SDKs and development tools

cpak models SDKs as addon packages. An editor declares the SDK origins it supports, then each user enables only the toolchains needed by that editor.

## Enable an official SDK

Install the editor and SDK packages, then enable the addon:

```bash
cpak install github.com/containerpak/vscode
cpak install github.com/containerpak/sdk-go
cpak addon enable github.com/containerpak/vscode github.com/containerpak/sdk-go
```

The current official SDK packages include Go and Node LTS. They export their normal command paths, including compatibility links used by tools that expect `/usr/bin` or `/usr/local/bin`.

```bash
cpak install github.com/containerpak/sdk-node-lts
cpak addon enable github.com/containerpak/vscode github.com/containerpak/sdk-node-lts
```

Run VS Code through cpak after changing the addon selection. Its integrated terminal and extensions see the enabled SDK binaries in the same package environment.

## Create an SDK package

An SDK is a manifest v2 package. Its image contains the toolchain while editor state stays with the parent application. Declare every command that other tools may call:

```json
{
  "$schema": "https://raw.githubusercontent.com/Containerpak/cpak/v2/schema/manifest-v2.json",
  "manifest_version": "2.0",
  "name": "Example SDK",
  "description": "Example language tools for cpak development environments.",
  "version": "1.0.0",
  "image": "ghcr.io/example/sdk-example:main",
  "binaries": ["/usr/local/bin/example", "/usr/local/bin/examplefmt"],
  "desktop_entries": [],
  "dependencies": [],
  "addons": [],
  "addon_provider": {
    "id": "example",
    "slot": "sdk.example",
    "mode": "exclusive",
    "exports": {
      "path": ["/usr/local/bin"]
    }
  },
  "idle_time": 0,
  "override": {
    "filesystem": [{ "path": "home", "access": "read-write" }],
    "network": true
  }
}
```

The provider slot lets an editor discover an installed SDK without hard-coding
its filesystem layout. Use `exclusive` for alternative versions of one
toolchain and `multiple` when the providers are meant to coexist. Export
non-standard binary, library, include, pkg-config, and CMake paths instead of
copying compatibility links into the parent.

The parent's permission set remains authoritative after the SDK is mounted. The SDK manifest describes its standalone behavior and validation surface.

## Test an SDK

Verify the package by itself:

```bash
cpak test cpak.json --binary /usr/local/bin/example -- --version
```

Then test it as an enabled addon in each supported editor. Open a login shell and a non-login shell, because editors and build tasks do not always initialize the same environment.

For a language SDK, compile and run a minimal project. Cover imports, compilers, subprocesses, and output paths in addition to the version command.

## Version updates

Update the image, manifest version, documentation, and CI checks together. Publish every advertised architecture. Keep an immutable tag or digest available long enough for lock files and rollback records to resolve the tested content.
