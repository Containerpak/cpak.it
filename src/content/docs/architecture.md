---
title: Architecture
description: How cpak combines Git manifests, OCI layers, and isolated application processes.
tags: [architecture]
---

# Architecture

The manifest is the package contract. Git provides the source and version, while the referenced OCI image provides immutable content. cpak downloads each layer by digest and mounts the ordered layers with OverlayFS when the application starts.

The writable container state is kept apart from the shared layer store. Updates resolve a new manifest and replace the application layer set without copying the base image for every installation.

Applications run in isolated mount and process namespaces. Explicit overrides connect only the host services they need, such as Wayland, PulseAudio, D-Bus, GPU devices, or the network. NVIDIA support resolves the host driver files at launch so packages do not need to ship a copy of the driver.
