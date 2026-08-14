---
title: cpak concepts
description: The small set of objects behind packages, layers, state, permissions, and versions.
tags: [basics, architecture]
section: start
order: 30
---

# cpak concepts

cpak separates package identity from package contents. A Git repository describes the package and an OCI registry stores its image layers.

## Origin

The origin is the package repository without a protocol or trailing `.git`, such as `github.com/bottlesdevs/bottles`. It is the stable identity used by install, update, run, override, addon, and rollback commands.

An alias is a local shortcut for an installed origin. Updates continue to resolve from the original package repository.

## Manifest

`cpak.json` is the package contract. Manifest v2 declares:

- package metadata and the OCI image
- exported binaries and desktop entries
- required cpak dependencies and optional addons
- idle lifecycle behavior
- filesystem, device, socket, broker, network, and resource permissions
- verified artifacts that must be installed at package installation time

Unknown fields and unsupported v2 features fail manifest validation.

## Image and layers

The image contains the application filesystem. cpak resolves the image to an immutable OCI digest and stores each layer by its content digest. Packages that reference the same bytes share those layers.

The origin remains the package identity when an update changes its image reference. Application data follows the origin across those updates.

## Writable state

Immutable image layers are mounted below a writable application layer. Application writes go to that layer. Package records, runtime state, logs, and exported desktop files use separate storage and recovery paths.

## Dependencies and addons

A dependency is required by the package and installed with it. Its manifest is part of the resolved dependency graph.

An addon is optional. The package author declares which addon origins are compatible, and the user enables a selection for one installed application. SDKs use this mechanism to add toolchains to editors without rebuilding the editor image.

## Permissions and overrides

The manifest declares the default host access for an application. A user override changes the effective permission set locally. Updates compare the old and new effective permissions, and new grants require approval in the interactive flow.

Permissions control concrete resources and broker actions. This includes paths, devices, sockets, network namespaces, nested user namespaces, resource limits, notifications, external URI opening, host applications, and typed host services.

## Source references

A package can follow a branch, select a release, or pin an exact commit. Commit installations remain pinned during update. Lock files record immutable manifest hashes and OCI digests for local development and CI.

## Store and catalog

Any valid package origin can be installed directly. The [Containerpak Store](/store) adds reviewed discovery metadata, categories, icons, and screenshots. Package manifests and images remain in their original repositories and registries.
