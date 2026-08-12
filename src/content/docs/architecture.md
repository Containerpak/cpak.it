---
title: Runtime architecture
description: How Git metadata, OCI layers, the local store, namespaces, and the application supervisor fit together.
tags: [architecture, runtime]
section: runtime
order: 10
---

# Runtime architecture

cpak is one Go binary that resolves package metadata, manages a content-addressed store, and starts rootless application environments through Linux kernel interfaces. It does not depend on a daemon such as Docker or Podman at runtime.

## Package resolution

An install starts from a Git origin. cpak resolves the selected branch, release, or commit and downloads `cpak.json`. The manifest is validated before image content or runtime sources become active.

The OCI image reference is resolved to an immutable digest. Dependency manifests are resolved through the same path. A lock file can record the exact manifest hashes and image digests for development and CI.

## Content store

Storage deduplication has two automatic levels. First, OCI layers are addressed by digest. The same layer referenced by several applications is downloaded once and occupies one stored copy. Second, every newly unpacked layer passes through DaBaDee before publication. It hashes the actual files and replaces equal content with hard links where the filesystem supports it. This catches duplicate bytes even when separate builds placed them in different layers and therefore produced different layer digests.

The OCI level avoids work for the complete matching layer. The DaBaDee level works below the image layout. A shared library, font, or asset can occupy one physical copy even when unrelated application images did not share a base layer.

Package records, immutable layers, writable application state, logs, exported desktop files, and transaction state are kept separately. This lets cpak recover an interrupted update without treating a partially staged version as active.

## Runtime view

At launch, cpak assembles ordered application, dependency, and enabled addon layers with OverlayFS. A writable upper layer receives application changes. The downloaded content remains immutable and reusable.

The environment receives a stable package identity through cpak-specific variables. Packages can use that identity to select first-class cpak behavior without pretending to be another package format.

## Isolation

cpak creates user, mount, PID, IPC, UTS, cgroup, and optional network namespaces directly. A small PID 1 process owns the container lifecycle and reaps child processes. A private Unix socket accepts bounded execution requests for the running instance.

Mounts are prepared from the package permission set and user overrides. The final process receives `no_new_privs`, a seccomp policy, and Landlock rules when the host kernel supports them.

## Host integration

Display, audio, devices, and explicitly requested sockets are mounted into the environment. Notifications, external URI requests, host application launches, and typed host services use the cpak system broker.

The application does not need to adopt a portal API. Existing Linux applications can call a compatibility command. The shim parses that command into a finite request before it crosses the sandbox boundary. The broker checks the package policy and returns output, errors, exit status, and cancellation without exposing a host shell.

## Lifecycle

An application can have named instances. `cpak run` starts or connects to the package environment and launches the selected binary. `cpak logs` reads instance output, while `cpak stop` terminates the supervised container.

An `idle_time` greater than zero allows an unused environment to stop after the declared number of minutes. Application state remains available for the next launch.

## Transactions

Installs and updates stage manifests, layers, runtime sources, and database changes before switching the active package record. The old version remains available for rollback after a successful update. Audit and repair inspect the relationship between records and files after an interrupted operation.
