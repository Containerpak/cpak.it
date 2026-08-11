---
title: Host compatibility
description: Linux, architecture, kernel, filesystem, desktop, init, and GPU requirements for the v2 runtime.
tags: [host, compatibility, requirements]
section: start
order: 40
---

# Host compatibility

Cpak runs on Linux and uses kernel facilities directly. The static runtime binary is published for `amd64` and `arm64`. Application architecture support also depends on the OCI image published by each package.

## Required host capabilities

`cpak doctor` is the authoritative check for the current machine. A working application runtime needs unprivileged user namespaces, rootless OverlayFS, and the mount operations used to assemble the package view.

```bash
cpak doctor
cpak doctor --json
```

The JSON report separates required checks from optional hardening and resource features. Its exit status matches the `ready` field.

## Distribution coverage

The portability workflow checks that the static Cpak binary runs and generates its schema on Debian 13, Fedora 42, Arch Linux, openSUSE Tumbleweed, and Ubuntu 26.04 userspace images.

Kernel integration tests run on several Ubuntu GitHub runner generations. These CI checks do not prove every desktop, filesystem, GPU, or init combination. Real application tests remain necessary.

## Filesystems

The Cpak store needs a filesystem that supports the operations used by rootless OverlayFS. DaBaDee hard-link deduplication works only when source and storage are on a compatible filesystem and the same mount.

Network filesystems, unusual FUSE mounts, or filesystems with restricted user namespace support may fail the runtime check. Keep the store on a local Linux filesystem for the broadest compatibility.

## Desktop sessions

Cpak can expose Wayland, X11, PulseAudio-compatible audio, accessibility, printing, and selected devices. The application manifest must enable the matching resource, and that resource must exist in the user session.

Headless packages do not require a desktop socket. Desktop packages should be tested on each display path they declare.

## Init and cgroups

Systemd is supported but not required. Cpak can run under another init when the user session supplies the needed runtime directories and sockets.

Memory, CPU, and process limits require delegated cgroup v2 controllers. Applications without requested limits can still run when delegation is absent. A requested limit fails if the host cannot apply it.

## Security features

Seccomp is required by the runtime policy. Landlock adds path restrictions on kernels that support the required ABI. `cpak doctor` reports Landlock as unavailable when the host cannot apply it.

## GPU support

DRI devices cover common Mesa-based graphics stacks. NVIDIA support resolves host userspace driver files at launch so packages do not need a copied driver. Driver passthrough must be tested on the target hardware and host driver version.

> [!NOTE] Experimental release
> Cpak v2 is launching as an experimental distribution option. The compatibility report tells you what the runtime can prove locally; package-specific hardware coverage is documented by each package.
