---
title: Build OCI images
description: Produce small, multi-architecture images with cached CI builds, checksums, SBOMs, and attestations.
tags: [images, ci, oci]
section: packages
order: 40
---

# Build OCI images

cpak consumes standard OCI images. The image should contain only the application, its runtime libraries, declared desktop files, and assets required inside the package. cpak itself does not need to be copied into the image.

## Use multiple stages

Compile or unpack software in a builder stage, then copy the runtime result into a clean final stage:

```dockerfile
FROM golang:1.26-bookworm AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -o /out/example ./cmd/example

FROM debian:13-slim
COPY --from=build /out/example /usr/bin/example
ENTRYPOINT ["/usr/bin/example"]
```

Build tools and package manager caches remain outside the final image. This matters even when layers are shared because every unique byte still has to be downloaded and stored once.

## Publish with GitHub Actions

Official Containerpak packages build images in GitHub Actions. A typical workflow publishes `amd64` and `arm64`, uses the GitHub Actions cache, and attaches provenance and an SBOM:

```yaml
name: Publish

on:
  push:
    branches: [main]
    paths:
      - Containerfile
      - cpak.json
      - .github/workflows/publish.yml

permissions:
  contents: read
  packages: write
  attestations: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-qemu-action@v3
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.repository_owner }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          context: .
          file: Containerfile
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ghcr.io/example/example:main
          cache-from: type=gha
          cache-to: type=gha,mode=max
          provenance: mode=max
          sbom: true
```

Add application-specific checks after the build. Verify every architecture that the workflow claims to publish.

## Base images

Choose a maintained base that supplies the ABI and runtime packages your application expects. The Containerpak `images` and `wine` repositories provide reusable environments for official packages with shared needs. They are bases, not copies of the final application.

Keep the distribution release explicit. A floating distribution tag can replace libraries without a corresponding package review.

## Layer layout

Group stable runtime content before frequently changing application content. OCI registries and cpak address layers by digest, so unchanged base layers can be shared by many packages and retained across updates.

Avoid a single giant `RUN` step when it causes an application update to invalidate unrelated runtime content. Avoid many tiny layers that exist only to mirror individual shell commands. Split at boundaries that are likely to change independently.

## External artifacts

Prefer downloading build inputs in CI and checking their vendor-provided checksum before use. If an artifact must be installed on the user's machine, declare it through `runtime_sources` with its HTTPS URL, exact size, SHA-256, and supported installer.

## Verify the result

After the image is published:

```bash
cpak validate cpak.json
cpak lock cpak.json
cpak test cpak.json
```

Run at least one declared binary. Desktop packages also need a real visual launch through cpak on each supported display path.
