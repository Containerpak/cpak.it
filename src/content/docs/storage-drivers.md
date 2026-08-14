---
title: Storage drivers
description: Implement and deploy a cpak storage driver through the versioned Unix socket protocol.
tags: [storage, drivers, protocol]
section: runtime
order: 25
---

# Storage drivers

A cpak storage driver derives persistent native directories from immutable source layers. cpak validates those directories, records them in an atomic runtime index, and gives them directly to rootless OverlayFS when an application starts.

The driver lifecycle is limited to preparation, verification, removal, and garbage collection. It exits after each maintenance operation. A prepared launch reads the runtime index directly.

## Built-in drivers

The default `fvs` driver reads authoritative FVS states and publishes verified native checkouts. Complete files reuse shared objects through reflinks or hard links where supported. FVS content-defined blocks remain the source of truth and can reconstruct a derived checkout.

The `dabadee` driver implements the same contract with whole-file deduplication. It supports compatibility testing and deployments that choose DaBaDee explicitly. Driver selection belongs to local cpak configuration and leaves application manifests portable.

Set the driver in cpak configuration or for one command:

```bash
CPAK_STORAGE_DRIVER=dabadee cpak storage migrate
```

## Protocol v1

Protocol v1 uses one newline-terminated JSON request and response per private Unix socket connection. Frames are limited to 1 MiB. The server checks the peer user ID and rejects unknown fields, unsupported protocol versions, invalid layer identifiers, and duplicate layers.

The methods are:

| Method     | Purpose                                                      |
| ---------- | ------------------------------------------------------------ |
| `probe`    | Report driver identity, protocol, and capabilities.          |
| `prepare`  | Publish persistent native checkouts for ordered layers.      |
| `verify`   | Check derived data and optionally repair it from the source. |
| `remove`   | Remove selected derived checkouts.                           |
| `gc`       | Report or remove derived data not referenced by live layers. |
| `shutdown` | Stop the on-demand driver process.                           |

Requests identify layers and operation options. Driver roots come from fixed process configuration. cpak validates every returned path against the assigned root, including symlink resolution.

## Implement a driver

The protocol is independent from the implementation language. A driver must:

- create its socket with mode `0600` below a private mode `0700` directory;
- accept only the same user ID on Linux;
- publish each checkout atomically;
- keep a valid checkout available when another preparation fails;
- treat derived directories as rebuildable data;
- keep source layers unchanged during verification, repair, removal, and garbage collection;
- return OverlayFS lower directories in highest-priority-first order.

Go implementations can use [`github.com/containerpak/storage`](https://github.com/Containerpak/storage). The module provides the protocol client and server, atomic runtime index, validation, and a shared conformance suite.

## External driver confinement

Set `CPAK_STORAGE_DRIVER_BINARY` to test an external implementation. cpak starts it without network access and restricts filesystem access to the assigned source, driver, and socket roots. If the host cannot apply the required confinement, cpak refuses to start the driver.

An official companion binary installed beside `cpak` is part of the same trusted release. A binary found through `PATH` is external and follows the confined path.

## Operations

Inspect and maintain the selected driver with:

```bash
cpak storage status
cpak storage status --json
cpak storage migrate
cpak storage verify
cpak storage verify --repair
```

Preparation keeps completed layer checkouts after an interrupted batch. The next attempt verifies and reuses them before publishing a new runtime index. Application data remains separate from these derived directories.
