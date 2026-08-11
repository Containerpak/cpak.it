---
title: Sandbox and threat model
description: What cpak isolates, what the manifest can reopen, and which protections depend on the host.
tags: [security, sandbox, runtime]
section: runtime
order: 20
---

# Sandbox and threat model

cpak starts applications without host root privileges. Its sandbox reduces the host surface visible to a package, then reopens resources declared by the package and accepted by the user.

## Namespace boundary

The runtime uses Linux namespaces for users, mounts, processes, IPC, hostname, cgroups, and optional networking. The process sees the assembled package root rather than the host root. The package PID 1 owns child cleanup and instance lifetime.

Nested user namespaces are blocked by default. A package can request `userNamespaces` for applications such as browsers that create another sandbox inside cpak.

## Filesystem boundary

Only the package root, runtime mounts, and declared host filesystem paths are present. Each host path has a read-only or read-write mode. Landlock narrows path access after mount setup when supported by the current kernel.

Landlock is an extra restriction, not a substitute for mount isolation. `cpak doctor` reports when it is unavailable.

## System call boundary

cpak applies `no_new_privs` before the application starts and uses seccomp to block disallowed system calls. A package cannot gain privileges through a setuid executable after this point.

The policy leaves the calls required by normal desktop applications and cpak's own runtime path. New application classes should be tested against the policy instead of disabling it globally.

## Resource controls

Memory, CPU, and process limits use delegated cgroup v2 controllers. cpak never reports a requested limit as active when the host cannot enforce it. The launch fails with a specific diagnostic.

Systemd is supported as a session manager but is not required. Other init systems can run cpak when the kernel features and user session resources are available.

## Host communication

Direct sockets and devices are opt-in manifest fields. Narrow system operations use brokers:

- hrun executes only named host commands accepted by package policy
- the system broker handles notifications and external URI opening
- local peer validation ties requests to the running package instance
- argument vectors are passed without shell expansion

The package does not receive unrestricted access merely because the compatibility shim exists in its filesystem.

## User overrides

The manifest defines defaults, not an unchangeable policy. Users can remove access or add a local grant. Updates compare the effective old and new permissions and ask before accepting additions.

`cpak update --non-interactive` rejects updates that require new permissions. This is the recommended mode for unattended systems.

## Limits of the boundary

A package with read-write home access can modify user files. A package with the session bus can call services exposed on that bus. Full devices, process sharing, system bus access, host root mounts, root inside the environment, and allowed host commands all expand the trusted surface.

Review the manifest before running an untrusted package. The Store highlights high-risk permissions, but the manifest and local override remain the authoritative policy.
