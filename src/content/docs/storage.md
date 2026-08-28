---
title: Store, deduplication, and cleanup
description: Inspect cpak data, repair interrupted transactions, share equal content, and reclaim unused space.
tags: [storage, gc, audit]
section: operations
order: 30
---

# Store, deduplication, and cleanup

cpak keeps immutable OCI content apart from writable application state. Cleanup commands operate on references in the package database so shared content is not removed while another package still uses it.

> [!WARNING] FVS Storage startup regression
> cpak v2.1.x can take longer than expected to start applications under certain conditions. Read the [incident notice](/announcements/fvs-storage) before downgrading because cpak v2.0.1 cannot read layers that have already migrated to FVS.

## Audit the store

```bash
cpak audit
```

Audit compares installed package records, layer references, transaction state, runtime sources, and stored files. Run it after an interrupted update, manual store move, or filesystem error.

Audit reads legacy and FVS layers in place. Migration, application launch, and downloads remain separate operations.

Apply supported repairs explicitly:

```bash
cpak audit --repair
```

Read the report before repair when the store contains important application data. Repair covers cpak metadata consistency. Restore externally deleted application files from a backup.

## Garbage collection

Preview unreferenced layers and cache entries:

```bash
cpak gc
cpak gc --json
```

Delete the reported data:

```bash
cpak gc --apply
```

Garbage collection retains layers referenced by installed packages, their active dependency graph, and rollback state. It removes FVS blocks after their final layer reference disappears and collects unreferenced DaBaDee objects. Storage migration has its own explicit lifecycle. A clean report has no candidate layers, cache entries, content objects, or reclaimable bytes.

## Automatic two-level deduplication

Image pull applies both storage levels automatically. Existing OCI layer digests are reused. A new layer streams through digest verification and decompression into the global FVS block store. The successful import retains the FVS representation used by installed packages.

FVS uses content-defined blocks. Equal ranges from different files and layers refer to the same block, including files that differ in a small region. Native checkouts add whole-file reuse through reflinks or hard links where supported.

`cpak dedup` provides DaBaDee-backed maintenance for an explicit external path:

```bash
cpak dedup --path /path/to/cpak/store
```

The command hashes regular files and reuses whole files through hard links when the source filesystem supports them. Compatible filesystems can also reuse matching ranges through reflinks.

## Prepare an existing cpak store

The graphical installer and `cpak self-update` prepare existing application layers after replacing the runtime binaries. `cpak-storaged` creates one verified native checkout per immutable layer and publishes an atomic runtime index. Completed layers are retained when a batch is interrupted and reused by the next attempt.

A desktop launch detects a missing required checkout, shows a progress dialog after 400 milliseconds, completes the affected layers, and then starts the application. Terminal launches report the same operation in the terminal. Prepared launches read the index directly.

Inspect or start the operation explicitly with:

```bash
cpak storage status
cpak storage migrate
cpak storage verify
cpak storage verify --repair
```

FVS remains the authoritative layer store. Native checkouts are derived data and can be verified or rebuilt. DaBaDee implements the same versioned storage driver contract for compatible deployments. Applications that use DaBaDee as a Go library can follow the independent [DaBaDee v2 migration guide](https://github.com/mirkobrombin/DaBaDee/blob/main/docs/migration-v2.md).

## Remove an application

```bash
cpak remove github.com/example/app
```

Removal resolves the source selector from the local record when only one copy
of the origin is installed. It stops and cleans the package containers, removes
the package record and exported desktop integration, then deletes every layer
that no other installed package or retained version references.

The private application home, persistent machine identity, and persistent file
grants remain available for a later reinstall. Delete them with the package
when they are no longer needed:

```bash
cpak remove --purge github.com/example/app
```

The purge applies only to state inside the cpak store. It never deletes host
files that the application accessed through filesystem permissions.

Run `cpak gc --apply` separately to reclaim unused shared content and download
cache. Garbage collection does not delete a private application home retained
by normal removal.

## Back up writable state

Back up application state and the cpak database together when you need a recoverable snapshot. Immutable layers can be downloaded again, but local application state and user overrides may not exist anywhere else.

Stop running instances before taking a filesystem-level snapshot. This avoids capturing a database or application file while it is being changed.
