Put the application in the OCI image when its license permits redistribution. The image is then a complete, content-addressed runtime that registries can cache and cpak can deduplicate by layer.

Use a runtime source when the software may be packaged but the vendor requires each user to download the original payload. The image stays thin and contains the wrapper, icon, desktop entry and integration files.

## A runtime source is still pinned

```
"runtime_sources": [
  {
    "url": "https://vendor.example/editor.deb",
    "sha256": "9f4d...",
    "size": 48310272,
    "installer": "deb-extract",
    "architecture": "amd64"
  }
]
```

cpak accepts HTTPS, verifies the exact byte count and SHA-256, then installs into a managed layer. If the vendor changes the file, the package revision must change too. A moving URL is not allowed to silently change an install.

## Do not run package scripts by habit

Use `deb-extract` or `rpm` when the payload is what you need. Use `dpkg` only when reviewed maintainer scripts are required. Tar archives use `tar`; a single artifact uses `file` with an explicit destination below `/opt`.

Test the package with an empty runtime source cache. A successful launch on a machine that already has the vendor program installed proves nothing about the recipe.
