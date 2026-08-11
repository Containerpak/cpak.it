---
title: Dependencies and addons
description: Compose packages with required runtime dependencies and optional per-application addons.
tags: [dependencies, addons, composition]
section: packages
order: 50
---

# Dependencies and addons

Dependencies and addons both contribute package layers, but they express different contracts.

## Required dependencies

A dependency is installed with the parent package. Use one when the application cannot work without the other package.

```json
"dependencies": [
  {
    "origin": "github.com/containerpak/umu",
    "branch": "main"
  }
]
```

The dependency can select a branch, release, or commit. `cpak lock` resolves the full graph and records immutable image digests. Installation stages dependencies before committing the parent package.

Dependencies are not copied into the parent OCI image. Their content-addressed layers remain reusable by every package that references them.

## Optional addons

An addon is a package that the parent explicitly supports but does not require:

```json
"addons": [
  "github.com/containerpak/sdk-go",
  "github.com/containerpak/sdk-node-lts"
]
```

List the available selection for an installed package:

```bash
cpak addon list github.com/containerpak/vscode
cpak addon list --json github.com/containerpak/vscode
```

Enable or disable one addon for that application:

```bash
cpak addon enable github.com/containerpak/vscode github.com/containerpak/sdk-go
cpak addon disable github.com/containerpak/vscode github.com/containerpak/sdk-go
```

The selection belongs to the parent application. Enabling an addon does not enable it globally and does not modify the parent manifest.

## Permission boundaries

An addon contributes files to the runtime view. It does not expand the effective host permissions of its parent. If a toolchain needs network or filesystem access, the application manifest and user override must already allow that access.

cpak prevents removing a package while another installed package still depends on it or uses it as an enabled addon.

## Update behavior

Dependencies are part of the package transaction. Addons have their own installed version and can be updated as normal packages. After an addon update, the next application launch builds its runtime view with the active addon layers.

## Choosing the right relationship

Use a dependency when absence would make the parent invalid. Use an addon when the parent remains useful without it and the user should control the selection. Put content directly in the parent image when it belongs only to that application and has no independent lifecycle.
