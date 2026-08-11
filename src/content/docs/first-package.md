---
title: Your first package
description: Create a v2 package repository, build its image, and test it without changing your installed applications.
tags: [packaging, tutorial]
section: packages
order: 10
---

# Your first package

A package repository needs an OCI image and `cpak.json`. Start with a command-line application so each part of the package can be checked before adding desktop integration.

## Create the repository

```bash
mkdir hello-cpak
cd hello-cpak
git init
```

Create a `Containerfile` that copies the application into a small runtime image. The binary paths declared later must exist in the final image, not only in a build stage.

```dockerfile
FROM debian:13-slim

RUN printf '#!/bin/sh\nprintf "Hello from cpak\\n"\n' > /usr/bin/hello-cpak \
    && chmod 0755 /usr/bin/hello-cpak

ENTRYPOINT ["/usr/bin/hello-cpak"]
```

Build and publish the image with your registry workflow. cpak reads standard OCI images and does not require a custom image builder.

## Generate the manifest

```bash
cpak init \
  --name "Hello cpak" \
  --description "Small package used to verify a cpak setup." \
  --version 1.0.0 \
  --image ghcr.io/your-name/hello-cpak:main \
  --binary /usr/bin/hello-cpak
```

The generated manifest uses version `2.0` and includes the current schema URL. Edit its `override` object so it grants only what the application needs. This command-line example does not need display, audio, devices, host files, or host commands.

## Validate before running

```bash
cpak validate cpak.json
cpak lock cpak.json
cpak test cpak.json --binary /usr/bin/hello-cpak
```

`cpak validate` checks the manifest contract. `cpak lock` resolves the root package and dependencies to immutable image digests. `cpak test` uses a temporary cpak store, verifies declared binaries and desktop entries, then runs the selected binary when requested.

The temporary flow does not export desktop entries or change applications installed in your normal store.

## Add a desktop application

Copy the application's `.desktop` file and icon into standard paths in the final image, then declare the desktop file:

```json
"desktop_entries": [
  "/usr/share/applications/com.example.Hello.desktop"
]
```

The `Exec` command in the desktop entry must point to a binary available in the package. cpak exports a host entry that launches the application through its installed origin and effective permissions.

## Test the developer flow

`cpak dev` performs the isolated package installation and launches the selected binary:

```bash
cpak dev cpak.json --binary /usr/bin/hello-cpak
```

Use `--origin` when relative dependencies need the future package origin. Use `--lock` to select a lock file explicitly.

## Publish the repository

Push the image first, then push the package repository. Anyone can install the package by its origin after `cpak.json` is reachable:

```bash
cpak install github.com/your-name/hello-cpak
```

Catalog submission is optional. Follow [Publish to the Store](/docs/publishing) when the package is ready for discovery on cpak.it.
