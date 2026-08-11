---
title: Store, deduplication, and cleanup
description: Inspect Cpak data, repair interrupted transactions, share equal content, and reclaim unused space.
tags: [storage, gc, audit]
section: operations
order: 30
---

# Store, deduplication, and cleanup

Cpak keeps immutable OCI content apart from writable application state. Cleanup commands operate on references in the package database so shared content is not removed while another package still uses it.

## Audit the store

```bash
cpak audit
```

Audit compares installed package records, layer references, transaction state, runtime sources, and stored files. Run it after an interrupted update, manual store move, or filesystem error.

Apply supported repairs explicitly:

```bash
cpak audit --repair
```

Read the report before repair when the store contains important application data. Repair targets Cpak metadata consistency; it does not reconstruct files deleted outside Cpak.

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

Garbage collection retains layers referenced by installed packages, their active dependency graph, and rollback state. A clean report has no candidate layers or cache entries and zero reclaimable bytes.

## Deduplicate equal files

```bash
cpak dedup --path /path/to/cpak/store
```

The DaBaDee-backed pass hashes files and replaces equal content with hard links when supported. OCI layer digests already deduplicate identical layers; the file pass can also find equal bytes that arrived through different layer layouts.

Deduplication requires a filesystem that supports hard links and does not cross filesystem boundaries. The logical package contents remain unchanged.

## Remove an application

```bash
cpak stop github.com/example/app
cpak remove github.com/example/app
cpak gc --apply
```

Removal deletes the package record and its exported desktop integration. Shared layers remain until no installed package or retained version references them.

## Back up writable state

Back up application state and the Cpak database together when you need a recoverable snapshot. Immutable layers can be downloaded again, but local application state and user overrides may not exist anywhere else.

Stop running instances before taking a filesystem-level snapshot. This avoids capturing a database or application file while it is being changed.
