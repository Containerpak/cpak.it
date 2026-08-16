---
title: Dependencies and addons
description: Connect required packages and optional per-application addons.
tags: [dependencies, addons, composition]
section: packages
order: 50
---

# Dependencies and addons

A cpak can require another package or offer it as an optional addon. Both keep
the component in its own repository and OCI image, but they have different
lifecycle and runtime contracts.

## Required dependencies

Dependencies are installed with the parent. The default mode is `nested`, which
keeps the dependency in its own sandbox and lets the parent invoke only the
binaries exported by that package.

```json
"dependencies": [
  {
    "origin": "github.com/containerpak/umu"
  }
]
```

The nested process receives the intersection of the parent and dependency
permissions. It cannot acquire host access that the parent does not have.

A dependency with `"mode": "layer"` is required too, but its filesystem layers
are composed below the parent image instead. Use this mode when the parent must
see the dependency files directly in its own runtime.

A dependency can select a branch, release or commit. `cpak lock` resolves the
full graph and records immutable image digests.

### Bottles and UMU

Bottles declares UMU as a nested dependency. The UMU integration needs the UMU
launcher, so cpak installs it with Bottles and exposes its declared command
through the nested package broker.

Nothing changes for Bottles users when optional addons are introduced elsewhere.
UMU remains required, starts in its own cpak environment and follows the
permission contract shared with Bottles.

## Optional addons

An addon contributes layers only when the user enables it for a supported
parent. The parent remains usable without it.

```json
"addons": [
  "github.com/containerpak/sdk-go",
  "github.com/containerpak/sdk-node-lts"
]
```

cpak installs an addon on first use, records the selection for that parent and
stops its current environment. The next launch composes required layer
dependencies, the parent and each enabled addon in manifest order.

Disabling an addon removes its layers from the next runtime view. It does not
rewrite the parent image or copy files into the application data directory.
One installed addon can serve several parents while each keeps its own selection.

## Managing addons

List the addons supported by an installed package:

```bash
cpak addon list github.com/containerpak/vscode
cpak addon list --json github.com/containerpak/vscode
```

Enable or disable one addon for that package:

```bash
cpak addon enable github.com/containerpak/vscode github.com/containerpak/sdk-go
cpak addon disable github.com/containerpak/vscode github.com/containerpak/sdk-go
```

`addon list` reports whether each option is installed and enabled. Enabling an
addon installs it when needed. Disabling it keeps the standalone package only
when another parent still uses it. cpak also prevents removal while it is enabled
for an installed parent.

Addons keep their own versions and update lifecycle. An updated addon becomes
visible the next time its parent starts.

## Steam example

Steam supports performance tools and compatibility builds as optional addons:

```json
"addons": [
  "github.com/containerpak/gamemode",
  "github.com/containerpak/gamescope",
  "github.com/containerpak/mangohud",
  "github.com/containerpak/proton-ge",
  "github.com/containerpak/protosoda"
]
```

Users can enable only the tools they want:

```bash
cpak addon enable github.com/containerpak/steam github.com/containerpak/mangohud
cpak addon enable github.com/containerpak/steam github.com/containerpak/protosoda
```

MangoHud, Gamescope and GameMode add commands, libraries and runtime metadata to
the composed Steam filesystem. They work with the launch options Steam already
uses:

```text
mangohud %command%
gamescope -- %command%
gamemoderun %command%
```

GE-Proton and ProtoSoda install their compatibility tool directories in the
composed filesystem. Steam discovers them through
`STEAM_EXTRA_COMPAT_TOOLS_PATHS`, so enabled builds appear in its compatibility
selector without being copied into the Steam data directory.

### Passing addons into pressure-vessel

Steam starts games inside Valve pressure-vessel, which replaces `/usr` with the
selected Steam runtime. The Steam package bridges its composed cpak root into
that nested runtime:

```sh
export PATH="$CPAK_ROOTFS/usr/bin:$CPAK_ROOTFS/usr/games:$PATH"
export STEAM_EXTRA_COMPAT_TOOLS_PATHS="$CPAK_ROOTFS/usr/share/steam/compatibilitytools.d"
export VK_ADD_LAYER_PATH="$CPAK_ROOTFS/usr/share/vulkan/implicit_layer.d"
export PRESSURE_VESSEL_FILESYSTEMS_RO="$CPAK_ROOTFS/usr"
```

`CPAK_ROOTFS` identifies the active composed root. Most applications do not need
this bridge. It is required when a parent starts another container or runtime
that hides the paths supplied by its addons.

## Packaging an addon

An addon is a normal cpak package with its own Git origin, manifest, image and
release history. The parent lists supported addon origins in `cpak.json`; the
addon owns every file it contributes.

Place files where the parent already expects to discover them. Commands can use
`/usr/bin`, libraries can use the platform library directories and plugins can
use a parent-specific path. If discovery needs an environment variable, define
it in the parent package so it resolves against `CPAK_ROOTFS` when necessary.

Keep addon paths separate where possible. Enabled addons follow the order in the
parent manifest, and a later layer wins when two packages provide the same path.

Use the same maintained platform family as the parent when it fits the package.
Equal OCI layers are stored once by digest, so a shared base does not add another
copy to the local store.

An addon uses the parent's effective host permissions while mounted into that
parent. Permissions in the addon manifest apply when the addon is run by itself;
they cannot expand the parent policy.

Test both states before publishing:

```bash
cpak addon enable github.com/example/parent github.com/example/addon
cpak run github.com/example/parent parent-command
cpak addon disable github.com/example/parent github.com/example/addon
cpak run github.com/example/parent parent-command
```

The enabled test must prove that the parent discovers the contributed files. The
disabled test must prove that the parent still starts and the addon is absent.

## Choosing the relationship

Use a nested dependency for a required tool that should keep its own sandbox.
Use a layer dependency for required files that must appear inside the parent
filesystem. Use an addon when the parent works without it and the user should
control the selection.
