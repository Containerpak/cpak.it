---
title: Build OCI images
description: Produce small, multi-architecture images with cached CI builds, checksums, SBOMs, and attestations.
tags: [images, ci, oci]
section: packages
order: 40
---

# Build OCI images

cpak consumes standard OCI images. Include the application, its runtime libraries, declared desktop files, and required assets. The cpak runtime stays on the host.

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

Choose a maintained base that supplies the ABI and runtime packages your application expects. The Containerpak `images` and `wine` repositories provide reusable environments for official packages with shared needs. Application payloads stay in their package images.

Keep the distribution release explicit. A floating distribution tag can replace libraries without a corresponding package review.

| Image                                | Base distribution | Intended use                                                                                                              | Recipe                                                                                          |
| ------------------------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `ghcr.io/containerpak/base:main`     | Ubuntu 26.04      | Minimal runtime, multiarch setup, and cpak cleanup helper                                                                 | [`platform/base`](https://github.com/Containerpak/images/blob/main/platform/base/Containerfile) |
| `ghcr.io/containerpak/mesa:main`     | Ubuntu 26.04      | OpenGL, Vulkan, Wayland, and 32-bit graphics runtime                                                                      | [`platform/mesa`](https://github.com/Containerpak/images/blob/main/platform/mesa/Containerfile) |
| `ghcr.io/containerpak/gtk:main`      | Ubuntu 26.04      | GTK 4, libadwaita, WebKitGTK, D-Bus, fonts, and the Mesa runtime                                                          | [`platform/gtk`](https://github.com/Containerpak/images/blob/main/platform/gtk/Containerfile)   |
| `ghcr.io/containerpak/wine:main`     | Ubuntu 26.04      | Host libraries for application images that supply Wine or Proton, including 32-bit graphics, audio, input, and multimedia | [`Containerpak/wine`](https://github.com/Containerpak/wine/blob/main/Containerfile)             |
| `ghcr.io/containerpak/base-sdk:main` | Ubuntu 26.04      | General C and C++ build environment                                                                                       | [`sdk/base`](https://github.com/Containerpak/images/blob/main/sdk/base/Containerfile)           |
| `ghcr.io/containerpak/mesa-sdk:main` | Ubuntu 26.04      | Graphics development headers and tools                                                                                    | [`sdk/mesa`](https://github.com/Containerpak/images/blob/main/sdk/mesa/Containerfile)           |
| `ghcr.io/containerpak/gtk-sdk:main`  | Ubuntu 26.04      | GTK, libadwaita, WebKitGTK, and Mesa development headers                                                                  | [`sdk/gtk`](https://github.com/Containerpak/images/blob/main/sdk/gtk/Containerfile)             |

The distribution choice defines the ABI and library versions available to the application. Pick the smallest base that already matches the software, pin the final application image by digest through cpak, and review base updates in CI before publishing them.

## Layer layout

Group stable runtime content before frequently changing application content. OCI registries and cpak address layers by digest, so unchanged base layers can be shared by many packages and retained across updates.

Avoid a single giant `RUN` step when it causes an application update to invalidate unrelated runtime content. Avoid many tiny layers that exist only to mirror individual shell commands. Split at boundaries that are likely to change independently.

## Design for two-level deduplication

Shared base images are useful beyond build consistency. cpak stores OCI layers by digest, so applications built on the same unchanged base reuse one downloaded and stored layer. A new layer is unpacked only when its digest is absent.

cpak streams a new layer directly into the global FVS content store. FVS splits file contents into content-defined blocks and reuses blocks already referenced by another layer. This catches equal ranges even when two images placed them in different files or produced different OCI digests.

```text
OCI digest match     -> reuse the complete layer
New OCI layer        -> verify and decode as one stream
FVS block match      -> reference the existing content block
Unique block         -> store one new content block
```

The first level reuses stable bases and matching layer boundaries. The second level finds repeated content across different layer layouts. Both run automatically during image pull. A successful import retains the FVS representation used by installed packages.

For registries and CDNs that preserve byte-range responses, `zstd:chunked` lets cpak read the layer table of contents first and skip compressed file ranges whose complete content already exists in FVS. cpak uses one complete stream for a cold store and switches to ranges only when known content makes that cheaper. A normal gzip or zstd pull remains the automatic fallback. Read [Choose and operate an OCI registry](/docs/registries) before enabling it in CI.

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
