A package release connects a Git revision, one manifest and the image digest produced for it. The repository is the package origin; the Store is a catalog that points people to that origin.

## Make the source and image agree

Build the image from the tagged source and publish every supported architecture. Record the immutable multi-architecture digest in the manifest v3 `image` field before validation. `cpak lock` then records the resolved package and dependency graph without following a moving image tag.

```
cpak validate cpak.json
cpak lock cpak.json
cpak test cpak.json
```

Attach an SBOM and build provenance in CI. Verify vendor checksums before copying artifacts into an image, and keep the final stage free of build caches.

## Write for the Store separately

`README.md` explains the repository to contributors. `STORE-README.md` explains installation, first launch or vendor authentication to the person using the package. The Store reads it from the same resolved tag or commit as the manifest, never from an unrelated moving branch.

## Review permission changes as API changes

Adding a permission changes the package contract. Interactive updates show the new request before activation. Non-interactive updates refuse a permission increase. Mention the reason in the package release rather than hiding it in a manifest diff.

Test first install, update, rollback and removal. If the package has addons or nested dependencies, include their install and cleanup paths in the test.

[Publishing packages](/docs/publishing) covers Store metadata, signatures and release channels.
