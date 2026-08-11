---
title: Quick start
description: Install, launch, update, and remove your first cpak application.
tags: [basics, cli]
section: start
order: 20
---

# Quick start

A cpak package is addressed by its Git repository. The repository contains the package contract, while its manifest points to the OCI image that contains the application.

## Check the runtime

```bash
cpak doctor
```

Resolve required failures before continuing. Warnings describe optional host features that cpak cannot apply on the current system.

## Install an application

Install a package directly from its origin:

```bash
cpak install github.com/bottlesdevs/bottles
```

cpak resolves the repository reference, validates `cpak.json`, downloads missing image layers by digest, installs declared dependencies, and commits the package record only after the staged data is ready.

Packages can follow a branch or release, or remain pinned to a commit:

```bash
cpak install --branch main github.com/bottlesdevs/bottles
cpak install --release v1.0.0 github.com/example/app
cpak install --commit 0123456789abcdef github.com/example/app
```

## Run it

The command accepts the package origin and an optional exported binary:

```bash
cpak run github.com/bottlesdevs/bottles bottles
```

Arguments after the binary are passed to the application as an argument vector:

```bash
cpak run github.com/example/editor editor ./notes.txt
```

Use an alias when you do not want to repeat the origin:

```bash
cpak alias set bottles github.com/bottlesdevs/bottles
cpak run bottles bottles
```

## Inspect the installation

```bash
cpak list
cpak list --json
cpak logs github.com/bottlesdevs/bottles
```

`cpak shell` opens an interactive shell inside the installed package. It receives the same package layers and configured mounts, which makes it useful for diagnosis.

## Update safely

```bash
cpak update github.com/bottlesdevs/bottles
cpak update
```

If an update requests new permissions, the interactive command shows the additions before applying it. Automation can reject such changes with `cpak update --non-interactive`.

Restore the previous installed version when an update needs to be reverted:

```bash
cpak rollback github.com/bottlesdevs/bottles
```

## Remove it

```bash
cpak stop github.com/bottlesdevs/bottles
cpak remove github.com/bottlesdevs/bottles
cpak gc --apply
```

Removing a package does not delete layers still referenced by another package. Garbage collection reports unreferenced data before deleting it.

Continue with [cpak concepts](/docs/concepts) to understand how origins, images, state, and permissions fit together.
