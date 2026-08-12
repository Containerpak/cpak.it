---
title: cpak concepts
description: The small set of objects behind packages, layers, state, permissions, and versions.
tags: [basics, architecture]
section: start
order: 30
---

# cpak concepts

cpak separates package identity from package contents. This lets a normal Git repository describe an application while OCI registries handle large binary layers.

## Origin

The origin is the package repository without a protocol or trailing `.git`, such as `github.com/bottlesdevs/bottles`. It is the stable identity used by install, update, run, override, addon, and rollback commands.

An alias is only a local shortcut for an installed origin. It does not create a new package or change where updates come from.

## Manifest

`cpak.json` is the package contract. Manifest v2 declares:

- package metadata and the OCI image
- exported binaries and desktop entries
- required cpak dependencies and optional addons
- idle lifecycle behavior
- filesystem, device, socket, broker, network, and resource permissions
- verified artifacts that must be installed at package installation time

Unknown fields are rejected. A runtime that cannot apply a declared v2 feature rejects the package instead of ignoring it.

## Image and layers

The image contains the application filesystem. cpak resolves the image to an immutable OCI digest and stores each layer by its content digest. Packages that reference the same bytes share those layers.

The image is not the package identity. A package can change its image reference during an update while keeping the same origin and application data.

## Writable state

Immutable image layers are mounted below a writable application layer. Changes made by the application do not modify the downloaded OCI content. Package records, runtime state, logs, and exported desktop files remain separate so cpak can update or recover them independently.

## Dependencies and addons

A dependency is required by the package and installed with it. Its manifest is part of the resolved dependency graph.

An addon is optional. The package author declares which addon origins are compatible, and the user enables a selection for one installed application. SDKs use this mechanism to add toolchains to editors without rebuilding the editor image.

## Permissions and overrides

The manifest declares the default host access for an application. A user override changes the effective permission set locally. Updates compare the old and new effective permissions, and new grants require approval in the interactive flow.

Permissions control concrete resources and broker actions. This includes paths, devices, sockets, network namespaces, nested user namespaces, resource limits, notifications, external URI opening, host applications, and typed host services.

## Source references

A package can follow a branch, select a release, or pin an exact commit. Commit installations do not move during update. Lock files add immutable manifest hashes and OCI digests for local development and CI.

## Store and catalog

cpak does not require a central catalog. Any valid package origin can be installed directly. The [Containerpak Store](/store) is a reviewed index that adds discovery, categories, icons, screenshots, and package metadata without becoming the package source of truth.
