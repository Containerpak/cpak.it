---
title: Runtime architecture
description: How Git metadata, OCI layers, the local store, namespaces, and the application supervisor fit together.
tags: [architecture, runtime]
section: runtime
order: 10
---

# Runtime architecture

cpak uses two static Go binaries. The `cpak` client resolves packages and starts rootless application environments through Linux kernel interfaces. `cpak-storaged` prepares, verifies, and collects persistent layer checkouts during maintenance operations, then exits. Prepared applications start directly from the runtime index and rootless OverlayFS.

## Package resolution

An install starts from a Git origin. cpak resolves the selected branch, release, or commit and downloads `cpak.json`. The manifest is validated before image content or runtime sources become active.

The native OCI Distribution client resolves the image reference to an immutable digest, selects the current Linux architecture from an image index, validates every descriptor, and checks downloaded content against its SHA-256 digest. Dependency manifests are resolved through the same path. A lock file can record the exact manifest hashes and image digests for development and CI.

Registry access begins anonymously. Private packages use an explicit credential binding scoped to the package origin, registry host, and repository path. cpak keeps these bindings in its own credential store.

## Content store

Storage deduplication has two automatic levels. OCI layers are addressed by digest, so the same layer referenced by several applications is downloaded once. FVS stores file content as shared content-defined blocks, so equal ranges occupy one physical copy even when separate builds placed them in different layers.

The OCI level reuses a complete matching layer. FVS works below the image layout and shares content-defined blocks across unrelated images, including libraries, fonts, and assets. This level works on local filesystems with or without hard-link and reflink support.

Package records, immutable layers, writable application state, logs, exported desktop files, and transaction state are kept separately. Recovery discards incomplete staging data and preserves the active version.

FVS remains the authoritative source for immutable layer content. A storage driver derives persistent native directories from that source. The default FVS driver reuses complete files through reflinks or hard links where the filesystem permits it. The DaBaDee driver implements the same contract for compatibility and alternative deployments.

## Runtime view

Each prepared layer has an immutable native checkout and an entry in an atomic runtime index. At launch, cpak reads that index and passes the ordered application, dependency, and enabled addon directories directly to rootless OverlayFS. A writable upper layer receives application changes while FVS content stays immutable and shared.

A prepared launch reads the runtime index and mounts the listed directories immediately. Storage processes and per-application materialization stay in the maintenance path. If an update was interrupted before a required checkout was published, the desktop entry shows preparation progress, resumes complete layers, and starts the application after the runtime index is ready.

The environment receives cpak runtime variables. `CPAK_CONTAINER_ID` contains an opaque identifier for the active instance and can be used to detect a cpak launch.

## Isolation

cpak creates user, mount, PID, IPC, UTS, cgroup, and optional network namespaces directly. A small PID 1 process owns the container lifecycle and reaps child processes. A private Unix socket accepts bounded execution requests for the running instance.

Mounts are prepared from the package permission set and user overrides. The final process receives `no_new_privs`, a seccomp policy, and Landlock rules when the host kernel supports them.

## Host integration

Display, audio, devices, and explicitly requested sockets are mounted into the environment. Notifications, external URI requests, host application launches, and typed host services use the cpak system broker.

Compatibility commands cover notifications, URI opening, host application launches, and supported host services. Each shim parses a finite request before it crosses the sandbox boundary. The broker checks the package policy and returns output, errors, exit status, and cancellation.

## Lifecycle

An application can have named instances. `cpak run` starts or connects to the package environment and launches the selected binary. `cpak logs` reads instance output, while `cpak stop` terminates the supervised container.

An `idle_time` greater than zero allows an unused environment to stop after the declared number of minutes. Application state remains available for the next launch.

## Transactions

Installs and updates stage manifests, layers, runtime sources, and database changes before switching the active package record. The old version remains available for rollback after a successful update. Audit and repair inspect the relationship between records and files after an interrupted operation.

Storage preparation follows the same model. A driver writes a private partial checkout, verifies it, synchronizes it, and publishes it with an atomic rename. cpak updates the runtime index only after validating every returned directory. Completed layers survive an interrupted batch and are reused by the next attempt.
