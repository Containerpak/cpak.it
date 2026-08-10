---
title: Install cpak
description: Install the cpak CLI and prepare a Linux host.
tags: [install]
---

# Install cpak

cpak is a single Go command line application. Download the binary that matches your architecture, place it in a directory on your `PATH`, and verify it with:

```bash
cpak --help
```

Running an application may require user namespaces, OverlayFS, and a working host command bridge. cpak checks these capabilities when it starts the service. The host keeps ownership of display, audio, GPU, and other resources while the application runs in its own mount and process namespaces.

The application store lives below the user data directory by default. It keeps content-addressed image layers separately from writable container state, so removing one application does not remove layers still used by another.
