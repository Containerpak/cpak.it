---
title: Host compatibility
description: Linux, architecture, kernel, filesystem, desktop, init, and GPU requirements for the v2 runtime.
tags: [host, compatibility, requirements]
section: start
order: 40
---

# Host compatibility

cpak runs on Linux and uses kernel facilities directly. The static runtime binary is published for `amd64` and `arm64`. Application architecture support also depends on the OCI image published by each package.

## Required host capabilities

`cpak doctor` is the authoritative check for the current machine. A working application runtime needs unprivileged user namespaces, FUSE, rootless OverlayFS, and the mount operations used to assemble the package view.

```bash
cpak doctor
cpak doctor --json
```

The JSON report separates required checks from optional hardening and resource features. Its exit status matches the `ready` field.

## Distribution coverage

The portability workflow checks that the static cpak binary runs and generates its schema on Debian 13, Fedora 42, Arch Linux, openSUSE Tumbleweed, and Ubuntu 26.04 userspace images.

Kernel integration tests run on several Ubuntu GitHub runner generations. Validate the target desktop, filesystem, GPU, and init combination with `cpak doctor` and an application smoke test.

## Filesystems

The cpak store needs a local filesystem that supports the operations used by FVS and rootless OverlayFS. FVS content deduplication does not require hard links or reflinks. The host must expose `/dev/fuse` to the user session.

Network filesystems, unusual FUSE mounts, or filesystems with restricted user namespace support may fail the runtime check. Keep the store on a local Linux filesystem for the broadest compatibility.

## Desktop sessions

cpak can expose Wayland, X11, PulseAudio-compatible audio, accessibility, printing, and selected devices. The application manifest must enable the matching resource, and that resource must exist in the user session.

Headless packages can omit desktop sockets. Test desktop packages on each display path they declare.

## Init and cgroups

cpak runs under the host's user service manager. The user session must provide the required runtime directories and sockets.

Memory, CPU, and process limits require delegated cgroup v2 controllers. Applications without requested limits can still run when delegation is absent. A requested limit fails if the host cannot apply it.

## Security features

Seccomp is required by the runtime policy. Landlock adds path restrictions on kernels that support the required ABI. `cpak doctor` reports Landlock as unavailable when the host cannot apply it.

## GPU support

DRI devices cover common Mesa-based graphics stacks. NVIDIA support resolves host userspace driver files at launch. Test driver passthrough on the target hardware and host driver version.

> [!NOTE] Experimental release
> cpak v2 is launching as an experimental distribution option. The compatibility report tells you what the runtime can prove locally; package-specific hardware coverage is documented by each package.
