---
title: Runtime architecture
description: How Git metadata, OCI layers, the local store, namespaces, and the application supervisor fit together.
tags: [architecture, runtime]
section: runtime
order: 10
---

# Runtime architecture

cpak is one Go binary that resolves package metadata, manages a content-addressed store, and starts rootless application environments through Linux kernel interfaces. OCI content is pulled and mounted directly by cpak.

## Package resolution

An install starts from a Git origin. cpak resolves the selected branch, release, or commit and downloads `cpak.json`. The manifest is validated before image content or runtime sources become active.

The native OCI Distribution client resolves the image reference to an immutable digest, selects the current Linux architecture from an image index, validates every descriptor, and checks downloaded content against its SHA-256 digest. Dependency manifests are resolved through the same path. A lock file can record the exact manifest hashes and image digests for development and CI.

Registry access is anonymous unless the user creates an explicit credential binding for the package origin. cpak never reads Docker configuration, Podman authentication files, or external credential helpers. A stored credential is valid only for its package origin, registry host, and repository path.

## Content store

Storage deduplication has two automatic levels. First, OCI layers are addressed by digest. The same layer referenced by several applications is downloaded once and occupies one stored copy. Second, every newly unpacked layer passes through DaBaDee before publication. It hashes the actual files and replaces equal content with hard links where the filesystem supports it. This catches duplicate bytes even when separate builds placed them in different layers and therefore produced different layer digests.

The OCI level avoids work for the complete matching layer. The DaBaDee level works below the image layout. A shared library, font, or asset can occupy one physical copy even when unrelated application images did not share a base layer.

Package records, immutable layers, writable application state, logs, exported desktop files, and transaction state are kept separately. Recovery discards incomplete staging data and preserves the active version.

## Runtime view

At launch, cpak assembles ordered application, dependency, and enabled addon layers with OverlayFS. A writable upper layer receives application changes. The downloaded content remains immutable and reusable.

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
