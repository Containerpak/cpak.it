---
title: Test a package
description: Validate contracts, run isolated package checks, and cover desktop behavior before publication.
tags: [testing, ci, packaging]
section: packages
order: 70
---

# Test a package

Package testing should prove the manifest, image, exported files, runtime behavior, and desktop integration. cpak provides isolated developer commands so those checks do not alter the user's installed store.

## Static validation

```bash
cpak validate cpak.json
```

This rejects unknown fields, invalid manifest versions, malformed permission entries, missing required fields, and values outside the v2 schema.

Generate the current schema directly from the runtime when comparing editor or CI validation:

```bash
cpak gen-schema --output manifest-v2.json
```

## Reproducible resolution

```bash
cpak lock cpak.json
```

The lock file records the root and dependency manifests, their SHA-256 hashes, and immutable OCI image references. Commit a lock file when your project workflow requires reproducible CI inputs. Regenerate it when a selected branch or release is intentionally updated.

## Isolated install test

```bash
cpak test cpak.json
cpak test cpak.json --binary /usr/bin/example -- --version
```

The command creates a temporary cpak store, installs the package, checks every declared binary and desktop entry, and optionally launches one binary. It does not export files to the user's desktop.

Use `--origin` for relative dependency resolution and `--lock` to select a non-default lock path.

## Developer launch

```bash
cpak dev cpak.json --binary /usr/bin/example
```

`cpak dev` uses the same isolated package setup and launches the requested application. This is the shortest path for visual checks while editing a package repository.

## Runtime checks

Cover the behavior that the application actually needs:

- create and reopen writable state
- open every declared desktop entry and exported binary
- exercise display, audio, GPU, input, printing, or camera permissions that are enabled
- verify denied resources remain unavailable
- update the package and confirm state remains intact
- roll back and verify the previous version still launches

SDKs need a real compile and run test. Packages with dependencies need a launch that uses the dependency. Packages with addons need both enabled and disabled runs.

## CI and architecture coverage

Build OCI images in CI and run application-specific smoke tests for every published architecture. Keep the final test commands in the package repository so maintainers can repeat them.

`cpak test` should remain part of package validation after the image is published. It validates the package through cpak rather than testing only the container image in isolation.

## Visual applications

A desktop package is not done when `--version` exits successfully. Launch it from cpak, confirm that windows render, check icons and desktop entries, and exercise the main workflows. Test Wayland and X11 paths when the manifest enables both.
