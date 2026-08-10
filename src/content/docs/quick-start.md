---
title: Quick start
description: Install a package from a Git repository and run it in an isolated cpak container.
tags: [basics, cli]
---

# Quick start

cpak installs an application from its manifest, downloads the OCI image layers, and starts it with the permissions declared by the package.

```bash
cpak install github.com/containerpak/hello
cpak run github.com/containerpak/hello
```

The first command stores the manifest and layers in the local cpak store. Shared layers are downloaded once and reused by every package that references them.

Use `cpak list` to inspect installed applications and `cpak update` to refresh them from their source.
