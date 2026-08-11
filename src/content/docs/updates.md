---
title: Updates, pins, and rollback
description: Choose a source reference, review permission changes, and recover the previous version.
tags: [updates, rollback, versions]
section: operations
order: 20
---

# Updates, pins, and rollback

cpak keeps the package origin separate from its selected Git reference and resolved OCI digest. This lets a package follow a maintained branch or remain fixed to an exact revision.

## Source selection

Install a moving branch:

```bash
cpak install --branch main github.com/example/app
```

Install a named release:

```bash
cpak install --release v2.1.0 github.com/example/app
```

Pin an immutable commit:

```bash
cpak install --commit 0123456789abcdef github.com/example/app
```

Commit installations report `pinned` during update and do not move. Branch and release behavior depends on the repository host and selected reference.

## Update one or all packages

```bash
cpak update github.com/example/app
cpak update
cpak update --json
```

Each result records the origin, old version, new version, source type, status, permission changes, permission additions, and failure reason when present.

## Permission review

An interactive update shows packages that request new permissions and asks once before continuing. The non-interactive mode refuses such updates:

```bash
cpak update --non-interactive
```

Use this mode for unattended jobs. A permission denial is a failed update result, and the previous package remains active.

## Atomic switch

cpak stages the new manifest, OCI layers, runtime sources, dependencies, desktop exports, and database record. It switches the active version only after staging succeeds. Recovery code handles transactions that were interrupted before commit.

If the image digest is unchanged but the manifest changed, cpak still refreshes package metadata and effective permissions.

## Roll back

```bash
cpak rollback github.com/example/app
```

Rollback restores the previous installed version and its manifest-derived runtime view. Writable application state remains separate from immutable package layers. Applications that migrate their own data may still require application-specific recovery.

## Lock files

`cpak lock` resolves a local package and dependencies to immutable content. It is meant for package development and CI, where following a moved tag during a test would make the result ambiguous.

```bash
cpak lock cpak.json
cpak test cpak.json --lock cpak.lock.json
```

Regenerate the lock file only when the selected package inputs are intentionally updated.
