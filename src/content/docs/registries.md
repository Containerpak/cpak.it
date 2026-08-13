---
title: Choose and operate an OCI registry
description: Select a registry, publish cpak images, enable partial pulls, and run a private registry safely.
tags: [registry, oci, hosting, zstd]
section: packages
order: 45
---

# Choose and operate an OCI registry

A cpak package keeps its manifest in Git while an OCI registry serves its immutable image content. cpak talks to the registry directly through the OCI Distribution API. Docker, Podman, and a local image daemon are not part of the runtime path.

## Client compatibility

cpak accepts OCI image manifests, OCI indexes, Docker schema 2 manifests, and Docker manifest lists. The selected image must contain a Linux manifest for the host architecture.

The registry must provide:

- the OCI Distribution `/v2/` API
- manifest and blob downloads by tag or SHA-256 digest
- correct descriptor sizes and blob contents
- HTTPS, except for a registry bound to the local loopback interface
- anonymous pulls or Basic/Bearer authentication

cpak verifies manifest and layer digests before publishing content into its local store. A registry redirect may point to HTTPS object storage or a CDN. Registry credentials are never forwarded to that host. A separate authentication host must be approved explicitly through `cpak auth login`.

## Choose a service

| Registry                                                                                                                                     | Good fit                                                                         | Operational work                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry) | Packages whose source and CI already live on GitHub                              | Managed by GitHub; package visibility and repository access remain separate settings |
| [Harbor](https://goharbor.io/docs/)                                                                                                          | Teams that need a web UI, project policies, replication, scanning, and retention | Operate Harbor, its database, object storage, backups, and upgrades                  |
| [CNCF Distribution](https://distribution.github.io/distribution/about/deploying/)                                                            | A small private or public registry with a narrow service surface                 | Supply TLS, authentication, storage, monitoring, backups, and garbage collection     |
| Another OCI registry                                                                                                                         | Existing infrastructure that already serves conforming OCI images                | Verify manifests, redirects, authentication, and byte-range behavior before release  |

Public packages work best with anonymous blob access. Private repositories need one credential binding for each package origin and exact registry repository. Read [Private OCI registries](/docs/registry-authentication) for the binding model.

## Publish regular OCI layers

gzip and zstd layers work on conforming registries. cpak streams a new layer directly through digest verification and decompression into FVS without keeping a second compressed copy or expanded layer directory.

Any OCI publisher can produce the image. Keep the final manifest in OCI format when the build system supports it, publish architecture indexes only for architectures that were tested, and record the resulting digest through `cpak lock`.

## Enable partial pulls

`zstd:chunked` adds a table of contents to a zstd layer. The layer descriptor carries the location and checksum of that table. cpak can inspect it with a byte-range request, reuse complete file content already present in FVS, and download only the compressed ranges needed for missing files.

cpak chooses the partial path only when reuse is high enough to reduce the transfer without creating hundreds of small requests. An empty store uses one complete verified stream. A warm store can skip file payloads already indexed by FVS. This decision is local and does not change the published image.

Podman can publish this format directly:

```bash
podman push \
  --format oci \
  --compression-format zstd:chunked \
  --force-compression \
  ghcr.io/example/application:main
```

The registry and every CDN or object-storage redirect in front of it must preserve `Range` requests and return `206 Partial Content` with an exact `Content-Range`. cpak verifies the compressed table checksum, file digests, offsets, and response lengths. Missing annotations, an unsupported proxy, or an invalid response disables the partial path for that layer and cpak downloads the complete zstd layer instead.

`zstd:chunked` is an optimization, not a package requirement. The same cpak release remains compatible with ordinary gzip and zstd images from other registries.

## GitHub Actions example

The following push step publishes an OCI image with chunk metadata after authentication:

```yaml
- name: Login to GHCR
  run: echo "${{ secrets.GITHUB_TOKEN }}" | podman login ghcr.io --username "${{ github.actor }}" --password-stdin

- name: Publish image
  run: |
    podman build --format oci --tag ghcr.io/example/application:main .
    podman push --format oci --compression-format zstd:chunked --force-compression ghcr.io/example/application:main
```

Grant the workflow `packages: write` and `contents: read`. Do not place a registry token in the manifest, repository, image, or workflow text.

## Self-hosting checklist

Start with a maintained OCI Distribution implementation. The development configuration shown by most registry projects is not a production deployment.

Before publishing packages, configure:

- a stable HTTPS name and certificate
- authentication and repository authorization when pulls are not public
- persistent filesystem or object storage
- backups for registry configuration and content
- storage monitoring and retention rules
- garbage collection for unreferenced manifests and blobs
- request limits that permit image manifests and large blob transfers
- proxy and CDN rules that retain `Range`, `Content-Range`, `Content-Length`, and `Docker-Content-Digest`

A registry with local filesystem storage should run as a single writer unless the storage is shared correctly. Replicated frontends need a common storage backend and consistent authentication state. Follow the storage model documented by the selected registry instead of copying one node's data directory between active instances.

Registry garbage collection is separate from `cpak gc`. Registry GC removes remote blobs no longer referenced by a remote manifest. `cpak gc` removes local FVS layers and blocks no longer referenced by installed packages or retained versions, plus unreferenced legacy DaBaDee data. It does not migrate referenced layers.

## Verify before release

Check the registry endpoint and then exercise the package through cpak:

```bash
curl --fail --silent --show-error https://registry.example/v2/
cpak validate cpak.json
cpak lock cpak.json
cpak test cpak.json
```

Repeat the test on every published architecture. Test once with an empty cpak store, then update from the previous image so shared layers, partial pulls, FVS reuse, and rollback all run against real registry responses.

If the package is private, repeat the test with the same `cpak auth` flow that users will follow. A successful Podman or Docker pull does not prove that the cpak credential binding or token-host policy is correct.

## Failure behavior

cpak treats optimization failures separately from integrity failures:

- unavailable byte ranges fall back to a complete layer download
- missing `zstd:chunked` annotations use the normal gzip or zstd path
- a digest or size mismatch rejects the layer
- a manifest without a matching Linux architecture is rejected
- an unapproved cross-host token request is rejected

This keeps package compatibility tied to the OCI image, while registry-specific performance features remain optional.
