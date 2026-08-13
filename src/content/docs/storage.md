---
title: Store, deduplication, and cleanup
description: Inspect cpak data, repair interrupted transactions, share equal content, and reclaim unused space.
tags: [storage, gc, audit]
section: operations
order: 30
---

# Store, deduplication, and cleanup

cpak keeps immutable OCI content apart from writable application state. Cleanup commands operate on references in the package database so shared content is not removed while another package still uses it.

## Audit the store

```bash
cpak audit
```

Audit compares installed package records, layer references, transaction state, runtime sources, and stored files. Run it after an interrupted update, manual store move, or filesystem error.

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

Garbage collection retains layers referenced by installed packages, their active dependency graph, and rollback state. It also removes DaBaDee objects and chunk records after their final layer reference disappears. A clean report has no candidate layers, cache entries, objects, chunks, or reclaimable bytes.

## Deduplicate equal files

Image pull applies both storage levels automatically. Existing OCI layer digests are reused. A new layer streams through decompression and DaBaDee while it is unpacked, so cpak does not keep a compressed cache copy beside the extracted layer. Use the command below for an explicit path or maintenance pass.

```bash
cpak dedup --path /path/to/cpak/store
```

The DaBaDee-backed pass hashes files and replaces equal content with hard links when supported. It can also split large files into content-defined chunks and reuse matching ranges through reflinks on filesystems that support them. Without reflinks, DaBaDee keeps whole-file deduplication and does not create a second chunk payload store.

Hard-link reuse requires source and store content on a compatible filesystem and the same mount. Chunk-range reuse requires reflinks. The logical package contents remain unchanged on filesystems without either optimization.

## Upgrade from the v1 store

The first v2 storage operation creates a separate DaBaDee v2 index. Existing v1 content remains readable and is adopted when a matching file is encountered. Adoption uses a hard link when possible and does not rewrite every installed layer during the update.

The v1 index stays in place, so an older cpak binary can still read an installation after the new index has been created. New storage features are ignored by the older binary.

Applications that use DaBaDee as a Go library can follow the [DaBaDee v2 migration guide](https://github.com/mirkobrombin/DaBaDee/blob/main/docs/migration-v2.md). cpak performs its own store adoption automatically.

## Remove an application

```bash
cpak stop github.com/example/app
cpak remove github.com/example/app
cpak gc --apply
```

Removal deletes the package record and its exported desktop integration. Shared layers remain until no installed package or retained version references them.

## Back up writable state

Back up application state and the cpak database together when you need a recoverable snapshot. Immutable layers can be downloaded again, but local application state and user overrides may not exist anywhere else.

Stop running instances before taking a filesystem-level snapshot. This avoids capturing a database or application file while it is being changed.
