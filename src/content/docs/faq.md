---
title: Frequently asked questions
description: Short answers about daemons, OCI images, portability, Flatpak, Docker, package stores, and application state.
tags: [faq, concepts]
section: project
order: 30
---

# Frequently asked questions

## Does cpak need Docker or Podman?

No. Package authors may use a standard OCI builder in CI, but the installed cpak runtime pulls and mounts OCI content directly. It does not start a Docker or Podman daemon.

## Is a cpak package an OCI image?

The image contains application files. The package is the Git origin plus its validated manifest, selected source reference, resolved image digest, dependencies, permissions, desktop exports, and local state.

## Is the Store required?

No. Install any valid package by its Git origin. The Store provides reviewed discovery metadata and media.

## How is cpak different from Flatpak?

cpak uses a Git manifest and OCI content, has one runtime binary, shares content-addressed layers, supports direct package dependencies and addons, and brokers selected host operations without requiring applications to adopt a portal API.

The formats also have different sandbox and distribution contracts. Treat cpak as its own target and use the cpak package identity rather than setting Flatpak environment variables.

## Does cpak share base runtimes?

Yes. Equal OCI layers are stored once, and DaBaDee can deduplicate equal files across different layer layouts. A shared base image remains an OCI build input rather than a separately installed global runtime.

## Where does application data go?

Each package has writable state separate from immutable image layers. Explicit filesystem permissions can also expose selected host paths. Removing a package and deleting its state is different from garbage-collecting unused immutable layers.

## Can one package use another?

Required dependencies are installed with the parent. Optional addons are enabled per application. Nested cpak adds a controlled execution path for a dependency that needs its own package environment.

## Can I add a language SDK to an editor?

Yes. Install a supported SDK package and enable it as an addon for that editor. The toolchain becomes part of the editor runtime view without rebuilding the editor image.

## Does cpak work without systemd?

Yes, provided the host supplies the required kernel features and user session resources. Delegated cgroup limits depend on the host cgroup manager and may be unavailable.

## Are updates automatic?

`cpak update` updates one or all installed packages. New permission grants require approval. `--non-interactive` rejects updates that request additional access.

## Can I roll back?

Yes. cpak retains the previous installed package version for `cpak rollback`. Application-managed data migrations may still need application-specific recovery.

## Is cpak stable?

cpak v2 is launching as an experimental option. Core transaction, sandbox, storage, package, SDK, and desktop flows are tested, while broader hardware and distribution coverage continues to grow.
