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
go run . gen-schema --output /tmp/manifest-v2.json
diff -u schema/manifest-v2.json /tmp/manifest-v2.json
```

The generated schema must match the committed schema. Add tests beside changed behavior. Runtime changes should cover failure paths and store recovery, not only a successful command.

## Test host behavior

```bash
./cpak doctor --json
```

Inspect every reported capability. Namespace, mount, Landlock, seccomp, cgroup, display, audio, init, and host bridge behavior depends on the host, so unit tests are not the final runtime check.

For a launch change, install or test a real package through the locally built cpak binary. For a package change, build the image in its GitHub workflow and test the published result through cpak.

## Work on packages

Each official package has its own repository under the Containerpak organization. The package repository owns `cpak.json`, its image recipe, tests, and application-specific integration.

Do not add an application workaround to the core runtime when it belongs in one package. Do not duplicate a shared runtime in every package when a base image or dependency owns it.

## Work on the website

The website is a SvelteKit application in [Containerpak/cpak.it](https://github.com/Containerpak/cpak.it). Documentation lives as Markdown under `src/content/docs` and is rendered locally by the site.

```bash
pnpm install
pnpm check
pnpm build
pnpm dev
```

Check desktop and mobile layouts for any visual change. Documentation code examples must match the current v2 CLI and schema.

## Keep changes focused

Follow the conventions already present in the target repository. Avoid unrelated formatting or dependency updates. A change should explain its behavior through code, tests, and a concise commit subject.

Use the repository's existing report templates when opening an issue. Include a reproducible command and raw evidence for runtime failures.

## Licenses

The cpak runtime uses the Fabricators Public Access License, FPAL-TCV 1.0. Package images also carry the licenses and redistribution terms of their included software. Review upstream terms before publishing binaries, icons, fonts, or screenshots.
