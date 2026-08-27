---
title: Publish to the Store
description: Prepare a package for the official catalog and add its reviewed metadata and media.
tags: [store, publishing, catalog]
section: packages
order: 80
---

# Publish to the Store

The Store is a discovery layer. Packages are also installable directly from a valid Git origin.

## Prepare the package origin

Before catalog submission, the package repository should contain:

- a valid manifest v3 file at `cpak.json`, with the image pinned to its OCI digest
- a published OCI image for every advertised architecture
- a concise README with install and test commands
- a CI workflow that builds the image and checks its exported binaries
- a real cpak test of the primary application path

Run the package validation flow against the public repository reference before submission.

The repository `README.md` belongs to maintainers and contributors. Add an optional `STORE-README.md` when users need package-specific instructions such as account setup, registry access, licensing terms, a large first download, or first-run behavior. The Store renders this file on the application page only when its catalog entry is pinned with `release`, and reads it from that exact release tag. It never reads `STORE-README.md` from `main`.

## Prepare catalog media

The official Store keeps discovery metadata in [Containerpak/store](https://github.com/Containerpak/store). Each application directory includes a catalog `manifest.json` and an original application icon named `icon.svg`. Screenshots use numbered WebP files, and an optional `showcase.webm` can demonstrate the application.

Use original project artwork. Do not invent a replacement icon for an upstream application. Preserve its license and attribution requirements.

## Choose a category

Place the catalog entry below the matching category and origin path. The origin path follows the repository address so it remains unique and inspectable.

```text
Graphics/
  github/
    com/
      example/
        editor/
          manifest.json
          icon.svg
          screenshot-1.webp
```

Do not edit generated catalog indexes by hand. The Store validation workflow rebuilds and checks them from source entries.

## Review package permissions

The Store displays effective manifest permissions to users. Broad filesystem access, all-device access, root execution, process sharing, session bus rules, and host service capabilities need a concrete package reason.

Runtime permissions come from the installed manifest and the user's local overrides. Catalog metadata is used for discovery and installer presentation.

## Keep the entry current

Package updates normally follow the source reference recorded by the catalog entry. Update screenshots and descriptions when the application's visible behavior changes. Remove claims that are no longer true.

The package repository is the source for `cpak.json` and image references. Store metadata points to that package contract.

## Installer downloads

The cpak release workflow produces signed graphical and terminal installers for listed applications. The release catalog binds Store metadata, source revision, architecture, permissions, and installer base into a verified capsule.

Read [cpak-installer](/docs/cpak-installer) for the direct endpoint, integration contract, release assets, and verification model.

## Federated catalogs

cpak's package identity is decentralized. Another project can maintain its own reviewed index with different categories and policies while pointing to the same package origins. Package installation remains independent from any catalog.
