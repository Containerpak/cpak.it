---
title: Contributing to cpak
description: Build the v2 branch, run its verification suite, and send focused changes to the correct repository.
tags: [contributing, development, go]
section: project
order: 10
---

# Contributing to cpak

The cpak project is split into the runtime, reusable libraries, package images, the Store, and this website. Start in the repository that owns the behavior you want to change.

## Build the runtime

The core repository uses the `v2` branch and Go 1.25 or newer as declared by `go.mod`.

```bash
git clone https://github.com/Containerpak/cpak.git
cd cpak
git switch v2
make all
./cpak --help
```

`make all` builds a static `cpak` binary with `CGO_ENABLED=0`. Keep generated binaries out of commits.

## Run the core checks

```bash
go test -race ./...
go vet ./...
go run . gen-schema --output /tmp/manifest-v3.json
diff -u schema/manifest-v3.json /tmp/manifest-v3.json
```

The generated schema must match the committed schema. Add tests beside changed behavior. Runtime changes must cover successful commands, failure paths, and store recovery.

## Test host behavior

```bash
./cpak doctor --json
```

Inspect every reported capability. Namespace, mount, Landlock, seccomp, cgroup, display, audio, init, and host bridge behavior depends on the host. Follow unit tests with a runtime check on a supported host.

For a launch change, install or test a real package through the locally built cpak binary. For a manifest change, validate and test the package repository. For an image change, build it through the `Containerpak/images` workflow and test the published result through cpak.

## Work on packages

Each official package has its own repository under the Containerpak organization. The package repository owns `cpak.json`, package and Store documentation, its signing workflow, and manifest-specific tests. `Containerpak/images` owns the image recipes and publishes the shared OCI images.

Application metadata and permissions belong in the package repository. Runtime files and image build workarounds belong in `Containerpak/images`. Shared ABI content belongs in a base image or dependency when several packages use it.

## Work on the website

The website is a SvelteKit application in [Containerpak/cpak.it](https://github.com/Containerpak/cpak.it). Documentation lives as Markdown under `src/content/docs` and is rendered locally by the site.

```bash
pnpm install
pnpm check
pnpm build
pnpm dev
```

Check desktop and mobile layouts for any visual change. Documentation code examples must match the current CLI and manifest v3 schema.

## Keep changes focused

Follow the conventions already present in the target repository. Avoid unrelated formatting or dependency updates. A change should explain its behavior through code, tests, and a concise commit subject.

Use the repository's existing report templates when opening an issue. Include a reproducible command and raw evidence for runtime failures.

## Licenses

The cpak runtime and every accepted contribution remain available under LGPL-2.1-only. Contributors must accept the [cpak Contributor License Agreement](https://github.com/Containerpak/cpak/blob/v2/CLA.md), which grants the project owners the rights required to maintain cpak while keeping contributions under the same public license.

Package images carry the licenses and redistribution terms of their included software. Review upstream terms before publishing binaries, icons, fonts, or screenshots.
