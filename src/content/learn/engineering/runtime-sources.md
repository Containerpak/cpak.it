Some software may be packaged but not redistributed inside a public OCI image. A runtime source keeps the cpak recipe public while the user's machine downloads the original artifact from the vendor.

## Declare one exact artifact

```
"runtime_sources": [
  {
    "name": "editor-amd64.deb",
    "url": "https://vendor.example/download/editor-amd64.deb",
    "sha256": "9f4d...64 hexadecimal characters...",
    "size": 48310272,
    "installer": "deb-extract",
    "architecture": "amd64"
  }
]
```

The URL must use HTTPS, including redirects. Size is checked against the announced and downloaded bytes. SHA-256 identifies the content, and an architecture filter prevents the wrong payload from being installed.

## Choose the smallest installer contract

`deb-extract` and `rpm` extract package payloads without turning the cpak into the host distribution. `tar` handles an archive. `file` installs one file at an explicit path below `/opt`. `dpkg` remains available for packages whose maintainer scripts are part of the required installation behavior.

Do not select `dpkg` because the input ends in `.deb`. Use it only when the scripts are necessary and have been reviewed. Extraction is the smaller trust boundary for most desktop payloads.

## Stage before switching the package

cpak downloads into a temporary file, limits the stream to the declared size, verifies the hash and installs into a managed runtime layer. An update stages the new manifest, OCI layers, runtime sources, exports and database record, then changes the active version only after every step succeeds.

A runtime source is not a mutable update channel. A changed vendor artifact requires a changed size or digest in a reviewed package revision. The installed source remains tied to that package version and participates in rollback.

## Keep user-facing metadata in the recipe

The thin OCI image still contains the wrapper, original icon, desktop entry and any integration files the application needs. The vendor payload supplies the program. The recipe supplies the cpak contract and a stable launch path.

[Manifest reference](/docs/manifest) lists the supported installer fields and validation rules.
