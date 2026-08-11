---
title: Publish to the Store
description: Prepare a package for the official catalog and add its reviewed metadata and media.
tags: [store, publishing, catalog]
section: packages
order: 80
---

# Publish to the Store

The Store is an optional discovery layer. Users can install any valid package by Git origin without waiting for a catalog entry.

## Prepare the package origin

Before catalog submission, the package repository should contain:

- a valid manifest v2 file at `cpak.json`
- a published OCI image for every advertised architecture
- a concise README with install and test commands
- a CI workflow that builds the image and checks its exported binaries
- a real cpak test of the primary application path

Run the package validation flow against the public repository reference, not only local files.

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

The Store displays effective manifest permissions to users. Broad filesystem access, all-device access, system bus access, root execution, process sharing, and host commands need a concrete package reason.

Catalog acceptance does not weaken the runtime sandbox. The installed package still follows its manifest and the user's local overrides.

## Keep the entry current

Package updates normally follow the source reference recorded by the catalog entry. Update screenshots and descriptions when the application's visible behavior changes. Remove claims that are no longer true.

The package repository remains the source for `cpak.json` and image references. The Store should not carry a divergent copy of the package contract.

## Federated catalogs

cpak's package identity is decentralized. Another project can maintain its own reviewed index with different categories and policies while pointing to the same package origins. The official Store is one catalog, not a requirement built into the package format.
