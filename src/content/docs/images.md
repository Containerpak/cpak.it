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

| Image                                     | Base distribution | Intended use                                                                                                              | Recipe                                                                                                            |
| ----------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `ghcr.io/containerpak/foundation:main`    | Ubuntu 26.04      | Pinned, single-layer Ubuntu foundation with certificates and the cpak APT policy                                          | [`platform/foundation`](https://github.com/Containerpak/images/blob/main/platform/foundation/Containerfile)       |
| `ghcr.io/containerpak/base:main`          | Ubuntu 26.04      | Compatibility name for the foundation                                                                                     | [`platform/base`](https://github.com/Containerpak/images/blob/main/platform/base/Containerfile)                   |
| `ghcr.io/containerpak/locales:main`       | Ubuntu 26.04      | Compiled locale data selected by cpak at installation time; not an application base                                       | [`platform/locales`](https://github.com/Containerpak/images/blob/main/platform/locales/Containerfile)             |
| `ghcr.io/containerpak/mesa64:main`        | Ubuntu 26.04      | 64-bit OpenGL, Vulkan, Wayland, and common font runtime                                                                   | [`platform/mesa64`](https://github.com/Containerpak/images/blob/main/platform/mesa64/Containerfile)               |
| `ghcr.io/containerpak/mesa-multilib:main` | Ubuntu 26.04      | `mesa64` with 32-bit graphics libraries                                                                                   | [`platform/mesa-multilib`](https://github.com/Containerpak/images/blob/main/platform/mesa-multilib/Containerfile) |
| `ghcr.io/containerpak/mesa:main`          | Ubuntu 26.04      | Multilib graphics runtime with Mesa and Vulkan command-line tools                                                         | [`platform/mesa`](https://github.com/Containerpak/images/blob/main/platform/mesa/Containerfile)                   |
| `ghcr.io/containerpak/gtk3:main`          | Ubuntu 26.04      | GTK 3 desktop applications with audio and 64-bit graphics                                                                 | [`platform/gtk3`](https://github.com/Containerpak/images/blob/main/platform/gtk3/Containerfile)                   |
| `ghcr.io/containerpak/webkitgtk:main`     | Ubuntu 26.04      | GTK 3 applications that use WebKitGTK 4.1                                                                                 | [`platform/webkitgtk`](https://github.com/Containerpak/images/blob/main/platform/webkitgtk/Containerfile)         |
| `ghcr.io/containerpak/gtk4:main`          | Ubuntu 26.04      | GTK 4 desktop applications                                                                                                | [`platform/gtk4`](https://github.com/Containerpak/images/blob/main/platform/gtk4/Containerfile)                   |
| `ghcr.io/containerpak/adwaita:main`       | Ubuntu 26.04      | GTK 4 applications that use libadwaita                                                                                    | [`platform/adwaita`](https://github.com/Containerpak/images/blob/main/platform/adwaita/Containerfile)             |
| `ghcr.io/containerpak/webkitgtk6:main`    | Ubuntu 26.04      | GTK 4 and libadwaita applications that use WebKitGTK 6                                                                    | [`platform/webkitgtk6`](https://github.com/Containerpak/images/blob/main/platform/webkitgtk6/Containerfile)       |
| `ghcr.io/containerpak/desktop:main`       | Ubuntu 26.04      | Complete desktop runtime for applications that require GTK 3, GTK 4, libadwaita, and WebKitGTK 4.1                        | [`platform/desktop`](https://github.com/Containerpak/images/blob/main/platform/desktop/Containerfile)             |
| `ghcr.io/containerpak/gtk:main`           | Ubuntu 26.04      | Compatibility name for `desktop`; new packages should select a versioned GTK branch                                       | [`platform/gtk`](https://github.com/Containerpak/images/blob/main/platform/gtk/Containerfile)                     |
| `ghcr.io/containerpak/wine:main`          | Ubuntu 26.04      | Host libraries for application images that supply Wine or Proton, including 32-bit graphics, audio, input, and multimedia | [`Containerpak/wine`](https://github.com/Containerpak/wine/blob/main/Containerfile)                               |

SDK images follow the same split:

| Image                                     | Intended use                                                 | Recipe                                                                                          |
| ----------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `ghcr.io/containerpak/base-sdk:main`      | General C and C++ build environment                          | [`sdk/base`](https://github.com/Containerpak/images/blob/main/sdk/base/Containerfile)           |
| `ghcr.io/containerpak/mesa64-sdk:main`    | 64-bit graphics headers and build tools                      | [`sdk/mesa64`](https://github.com/Containerpak/images/blob/main/sdk/mesa64/Containerfile)       |
| `ghcr.io/containerpak/mesa-sdk:main`      | Multilib graphics headers and tools                          | [`sdk/mesa`](https://github.com/Containerpak/images/blob/main/sdk/mesa/Containerfile)           |
| `ghcr.io/containerpak/gtk3-sdk:main`      | GTK 3 development headers                                    | [`sdk/gtk3`](https://github.com/Containerpak/images/blob/main/sdk/gtk3/Containerfile)           |
| `ghcr.io/containerpak/webkitgtk-sdk:main` | GTK 3 and WebKitGTK 4.1 development headers                  | [`sdk/webkitgtk`](https://github.com/Containerpak/images/blob/main/sdk/webkitgtk/Containerfile) |
| `ghcr.io/containerpak/gtk4-sdk:main`      | GTK 4 and libadwaita development headers                     | [`sdk/gtk4`](https://github.com/Containerpak/images/blob/main/sdk/gtk4/Containerfile)           |
| `ghcr.io/containerpak/desktop-sdk:main`   | Complete SDK for GTK 3, GTK 4, libadwaita, and WebKitGTK 4.1 | [`sdk/desktop`](https://github.com/Containerpak/images/blob/main/sdk/desktop/Containerfile)     |
| `ghcr.io/containerpak/gtk-sdk:main`       | Compatibility name for `desktop-sdk`                         | [`sdk/gtk`](https://github.com/Containerpak/images/blob/main/sdk/gtk/Containerfile)             |

The `main` tag follows the current platform build. `ubuntu-26.04` follows the current build for that Ubuntu release. Tags such as `ubuntu-26.04.20260814.3` and `sha-<revision>` identify one published platform state and are suitable for reproducible builds.

Official platform images identify the matching locale image in their OCI configuration. cpak reads the user's locale, imports only the required compiled directories, and adds the resulting shared layer to the application. Packages retain their own translation catalogs and do not need to include `locales-all`.

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
