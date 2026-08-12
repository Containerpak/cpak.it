---
title: Frequently asked questions
description: Short answers about daemons, OCI images, portability, Flatpak, Docker, package stores, and application state.
tags: [faq, concepts]
section: project
order: 30
---

# Frequently asked questions

## Does cpak need Docker or Podman?

No. Package authors can use any standard OCI builder in CI. The installed cpak runtime pulls and mounts OCI content directly.

## Is a cpak package an OCI image?

The image contains application files. The package is the Git origin plus its validated manifest, selected source reference, resolved image digest, dependencies, permissions, desktop exports, and local state.

## Is the Store required?

No. Install any valid package by its Git origin. The Store provides reviewed discovery metadata and media.

## How is cpak different from Flatpak?

cpak uses a Git manifest, OCI content, one runtime binary, content-addressed layers, direct package dependencies, addons, and policy-gated host operations.

The formats have different sandbox and distribution contracts. Applications can detect a cpak launch through `CPAK_CONTAINER_ID`.

## Does cpak share base runtimes?

Yes. Equal OCI layers are stored once, and DaBaDee deduplicates equal files across different layer layouts. Shared base images remain OCI build inputs.

## Where does application data go?

Each package has writable state separate from immutable image layers. Explicit filesystem permissions can also expose selected host paths. Removing a package and deleting its state is different from garbage-collecting unused immutable layers.

## Can one package use another?

Required dependencies are installed with the parent. Optional addons are enabled per application. Nested cpak adds a controlled execution path for a dependency that needs its own package environment.

## Can I add a language SDK to an editor?

Yes. Install a supported SDK package and enable it as an addon for that editor. The toolchain becomes part of the editor runtime view.

## Does cpak work without systemd?

Yes, provided the host supplies the required kernel features and user session resources. Delegated cgroup limits depend on the host cgroup manager and may be unavailable.

## Are updates automatic?

`cpak update` updates one or all installed applications. New permission grants require approval. `--non-interactive` rejects updates that request additional access.

The cpak binary checks for a new official release once per day. Desktop installations can show an update dialog and install it after confirmation. Distribution-managed builds report the update but leave installation to the system package manager.

## Can cpak pull a private image?

Yes. `cpak auth login` stores an explicit credential for one package origin and the exact OCI repository declared by its manifest. Desktop credentials use Secret Service. Headless systems can inject a user-owned mode `0600` credential file. cpak does not import Docker or Podman credentials.

## Can I roll back?

Yes. cpak retains the previous installed package version for `cpak rollback`. Application-managed data migrations may still need application-specific recovery.

## Is cpak stable?

cpak v2 is launching as an experimental option. Core transaction, sandbox, storage, package, SDK, and desktop flows are tested, while broader hardware and distribution coverage continues to grow.
