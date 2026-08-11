---
title: Release channels
description: Choose nightly, continuous, or versioned cpak builds and understand what each channel promises.
tags: [releases, versions, ci]
section: operations
order: 60
---

# Release channels

cpak publishes static Linux binaries for `amd64` and `arm64`. Every published build includes SHA-256 checksums, an SPDX JSON SBOM, and GitHub attestations for the binaries and SBOM.

## Continuous

The [continuous release](https://github.com/Containerpak/cpak/releases/tag/continuous) follows successful pushes to the `v2` branch. It is the current install source for developers and the cpak experimental launch.

Continuous receives completed v2 changes before a versioned release. Read the commit and workflow status before using it on irreplaceable application data.

## Nightly

The nightly release is produced by the scheduled build or a manual nightly workflow run. It verifies the repository at that point even when no new commit reached the continuous channel that day.

Use nightly for early compatibility testing and automated coverage. Do not assume that a nightly build has a longer support window than its source commit.

## Versioned releases

Tags matching `v*` publish versioned release assets and generated release notes. A versioned release is the reference to use when a project needs a named, reviewable cpak version.

The binary reports a development identifier such as `0.0.0-<commit>` when built from a branch. Tagged builds report their release version.

## Verify an asset

Download the matching binary and `SHA256SUMS`, then verify it before installation:

```bash
sha256sum -c SHA256SUMS --ignore-missing
```

GitHub attestations provide another verification path for release provenance. The SBOM lists the dependencies captured by the release workflow.

## Package releases

Application packages have their own repository and OCI image lifecycle. Updating the cpak binary does not silently update every package. Use `cpak update` to resolve installed packages and review any new permission requests.

Package image workflows should publish an immutable SHA tag beside their moving branch tag. Lock files and installed image digests preserve the exact content used by a test or transaction.
