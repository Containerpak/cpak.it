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

Audit reads legacy and FVS layers in place. It does not migrate layer content, start applications, or download missing data.

Apply supported repairs explicitly:

```bash
cpak audit --repair
```

Read the report before repair when the store contains important application data. Repair targets cpak metadata consistency; it does not reconstruct files deleted outside cpak.

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

Garbage collection retains layers referenced by installed packages, their active dependency graph, and rollback state. It removes FVS blocks after their final layer reference disappears and collects unreferenced DaBaDee objects left by the previous store. It checks both storage formats without migrating referenced legacy layers. A clean report has no candidate layers, cache entries, content objects, or reclaimable bytes.

## Automatic two-level deduplication

Image pull applies both storage levels automatically. Existing OCI layer digests are reused. A new layer streams through digest verification and decompression into the global FVS block store, without a compressed cache copy or an expanded layer directory.

FVS uses content-defined blocks. Equal ranges from different files and layers refer to the same block, including files that only differ in a small region. This works on local filesystems without requiring hard-link or reflink support.

`cpak dedup` remains available as a DaBaDee-backed maintenance tool for an explicit external path. It is not required for the cpak application store.

```bash
cpak dedup --path /path/to/cpak/store
```

The command hashes regular files and reuses whole files through hard links when the source filesystem supports them. It can reuse matching ranges through reflinks on compatible filesystems. These constraints apply to the explicit maintenance command, not to FVS application layers.

## Upgrade an existing cpak store

Existing installations remain available after updating cpak. Layers move to FVS only when an application needs them. cpak imports one legacy layer into a temporary FVS repository, verifies every entry, publishes it atomically, and removes the expanded copy only after the new layer is complete.

The terminal reports layer and byte progress. Desktop launches show the same operation in a progress dialog when it takes longer than a short startup threshold. An interrupted import leaves the legacy layer intact and resumes safely on the next launch.

DaBaDee remains installed as the compatibility reader and collector until old layers have moved. It is not used for newly downloaded cpak layers. Applications that use DaBaDee as a Go library can follow the independent [DaBaDee v2 migration guide](https://github.com/mirkobrombin/DaBaDee/blob/main/docs/migration-v2.md).

Package rollback continues to work through current cpak releases. A binary downgrade cannot read layers after their expanded legacy copies have been removed, so copy the store before testing an older cpak binary.

## Remove an application

```bash
cpak stop github.com/example/app
cpak remove github.com/example/app
cpak gc --apply
```

Removal deletes the package record and its exported desktop integration. Shared layers remain until no installed package or retained version references them.

The remove command stops and cleans only containers owned by the selected package. It releases package-specific layer metadata without running a store-wide audit. Run `cpak gc --apply` separately when you also want to reclaim shared content blocks which lost their final reference.

## Back up writable state

Back up application state and the cpak database together when you need a recoverable snapshot. Immutable layers can be downloaded again, but local application state and user overrides may not exist anywhere else.

Stop running instances before taking a filesystem-level snapshot. This avoids capturing a database or application file while it is being changed.
