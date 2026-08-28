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

`cpak doctor` is the authoritative check for the current machine. A working application runtime needs unprivileged user namespaces, rootless OverlayFS, and the mount operations used to assemble the package view.

```bash
cpak doctor
cpak doctor --json
```

The JSON report separates required checks from optional hardening and resource features. Its exit status matches the `ready` field.

## Distribution coverage

The portability workflow checks that the static cpak binary runs and generates its schema on Debian 13, Fedora 42, Arch Linux, openSUSE Tumbleweed, and Ubuntu 26.04 userspace images.

Kernel integration tests run on several Ubuntu GitHub runner generations. Validate the target desktop, filesystem, GPU, and init combination with `cpak doctor` and an application smoke test.

## Filesystems

The cpak store needs a local filesystem that supports FVS and rootless OverlayFS. Content-defined block sharing works on every supported local filesystem. Native layer checkouts prefer reflinks, then hard links, then independent files.

Network filesystems, existing FUSE mounts, and restricted user namespace configurations may fail the runtime check. Keep the store on a local Linux filesystem for the broadest compatibility. The prepared runtime path uses native directories and rootless OverlayFS.

## Desktop sessions

cpak can expose Wayland, isolated X11 compatibility, PulseAudio-compatible audio, accessibility, printing, Bluetooth, and selected devices. The application manifest must enable the matching resource. `displayX11` needs Xwayland on a Wayland session or Xephyr on an X11 session. `bluetooth` needs the host BlueZ service and its system bus. Packages that request neither feature do not gain those host requirements.

Headless packages can omit desktop sockets. Test desktop packages on each display path they declare.

## Init and cgroups

cpak runs under the host's user service manager. The user session must provide the required runtime directories and sockets.

Memory, CPU, and process limits require delegated cgroup v2 controllers. Applications request these controllers only when their manifest defines a limit. cpak rejects a requested limit when the host cannot apply it.

## Security features

Seccomp is required by the runtime policy. Landlock adds path restrictions on kernels that support the required ABI. `cpak doctor` reports Landlock as unavailable when the host cannot apply it.

## GPU support

DRI devices cover common Mesa-based graphics stacks. NVIDIA support resolves host userspace driver files at launch. Test driver passthrough on the target hardware and host driver version.

> [!NOTE] Experimental release
> cpak v2 is launching as an experimental distribution option. The compatibility report tells you what the runtime can prove locally; package-specific hardware coverage is documented by each package.
