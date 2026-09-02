---
title: Release channels
description: Choose nightly, continuous, or versioned cpak builds and understand what each channel promises.
tags: [releases, versions, ci]
section: operations
order: 60
---

# Release channels

cpak publishes static `cpak` and `cpak-storaged` Linux binaries plus Store installer bases for `amd64` and `arm64`. Every published build includes SHA-256 checksums, an SPDX JSON SBOM, and GitHub attestations for the binaries and SBOM.

## Continuous

The [continuous release](https://github.com/Containerpak/cpak/releases/tag/continuous) follows successful pushes to the `v2` branch. It is a prerelease channel for testing changes before the next versioned release.

Continuous receives completed branch changes before a versioned release. Read the commit and workflow status before using it on irreplaceable application data.

## Nightly

The nightly release is produced by the scheduled build or a manual nightly workflow run. It verifies the repository at that point even when no new commit reached the continuous channel that day.

Use nightly for early compatibility testing and automated coverage. Do not assume that a nightly build has a longer support window than its source commit.

## Versioned releases

Tags matching `v*` publish versioned release assets and generated release notes. The latest stable versioned release is the recommended installation source. Pin a named version when a project needs a reviewable cpak runtime.

The binary reports a development identifier such as `0.0.0-<commit>` when built from a branch. Tagged builds report their release version.

Store installer downloads contain the matching cpak binary. The signed catalog records its SHA-256 and pins each package to a Git commit, so a versioned Store installer installs the cpak build produced by that release workflow and the package revision selected when the release was built.

## Runtime update checks

Official binaries check the latest versioned release at most once per day. Run an immediate check or install:

```bash
cpak self-update --check
cpak self-update
```

The installer verifies both runtime binaries for the selected architecture against the release checksums before replacing installed files. Release candidates are older than the matching stable version, so a stable release replaces its candidate even when the numeric version is equal.

Packagers build with `SELF_UPDATE_MODE=managed`. This keeps the version notice and disables direct replacement:

```bash
make VERSION=v2.10.4 SELF_UPDATE_MODE=managed
```

The release version and update mode are compiled into the binary. Do not patch the runtime command or remove the update check in a package recipe.

## Verify an asset

Download the matching binary and `SHA256SUMS`, then verify it before installation:

```bash
sha256sum -c SHA256SUMS --ignore-missing
```

GitHub attestations provide another verification path for release provenance. The SBOM lists the dependencies captured by the release workflow.

## Package releases

Application packages have their own repository and OCI image lifecycle. Update them with `cpak update` and review any new permission requests.

Package image workflows should publish an immutable SHA tag beside their moving branch tag. Lock files and installed image digests preserve the exact content used by a test or transaction.
