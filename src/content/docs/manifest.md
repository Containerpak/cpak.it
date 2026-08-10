---
title: Manifest
description: Describe an application image, entry point, sources, and host permissions.
tags: [reference]
---

# Manifest

A cpak manifest connects an application name and version to an OCI image. It also declares the executable, optional runtime sources, addons, and the host resources the application may use.

```json
{
  "name": "Example",
  "version": "1.0.0",
  "image": "ghcr.io/example/app:1.0.0",
  "binaries": ["/usr/bin/example"],
  "override": {
    "network": true,
    "socketWayland": true,
    "deviceDri": true
  }
}
```

Permissions are applied when the container is started. A package does not gain host access merely because a file exists in its image.
