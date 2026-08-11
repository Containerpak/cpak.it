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

OCI layers are stored by digest. The same layer referenced by several applications occupies one stored copy. DaBaDee can replace equal files with hard links where the filesystem supports it, which removes duplicate bytes that appear across different layer layouts.

Package records, immutable layers, writable application state, logs, exported desktop files, and transaction state are kept separately. This lets cpak recover an interrupted update without treating a partially staged version as active.

## Runtime view

At launch, cpak assembles ordered application, dependency, and enabled addon layers with OverlayFS. A writable upper layer receives application changes. The downloaded content remains immutable and reusable.

The environment receives a stable package identity through cpak-specific variables. Packages can use that identity to select first-class cpak behavior without pretending to be another package format.

## Isolation

cpak creates user, mount, PID, IPC, UTS, cgroup, and optional network namespaces directly. A small PID 1 process owns the container lifecycle and reaps child processes. A private Unix socket accepts bounded execution requests for the running instance.

Mounts are prepared from the package permission set and user overrides. The final process receives `no_new_privs`, a seccomp policy, and Landlock rules when the host kernel supports them.

## Host integration

Display, audio, devices, and explicitly requested sockets are mounted into the environment. Host commands pass through hrun and a policy checked command bridge. Notifications and external URI requests use a dedicated system broker.

The application does not need to adopt a portal API. Existing Linux applications can call the provided compatibility command, while cpak decides whether the manifest allows the operation.

## Lifecycle

An application can have named instances. `cpak run` starts or connects to the package environment and launches the selected binary. `cpak logs` reads instance output, while `cpak stop` terminates the supervised container.

An `idle_time` greater than zero allows an unused environment to stop after the declared number of minutes. Application state remains available for the next launch.

## Transactions

Installs and updates stage manifests, layers, runtime sources, and database changes before switching the active package record. The old version remains available for rollback after a successful update. Audit and repair inspect the relationship between records and files after an interrupted operation.
