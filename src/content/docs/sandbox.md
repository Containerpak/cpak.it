---
title: Sandbox and threat model
description: What cpak isolates, what the manifest can reopen, and which protections depend on the host.
tags: [security, sandbox, runtime]
section: runtime
order: 20
---

# Sandbox and threat model

cpak starts applications as the current user. The sandbox exposes resources declared by the package and accepted by the user.

## Namespace boundary

The runtime uses Linux namespaces for users, mounts, processes, IPC, hostname, cgroups, and optional networking. The process sees the assembled package root. The package PID 1 owns child cleanup and instance lifetime.

Nested user namespaces are blocked by default. A package can request `userNamespaces` for applications such as browsers that create another sandbox inside cpak.

## Filesystem boundary

Only the package root, runtime mounts, and declared host filesystem paths are present. Each host path has a read-only or read-write mode. Landlock narrows path access after mount setup when supported by the current kernel.

Landlock adds path restrictions after mount isolation. `cpak doctor` reports when the host kernel cannot apply it.

## System call boundary

cpak applies `no_new_privs` before the application starts and uses seccomp to block disallowed system calls. A package cannot gain privileges through a setuid executable after this point.

The policy includes the calls required by supported desktop applications and the cpak runtime. Test a new application class against the policy before changing the global filter.

## Resource controls

Memory, CPU, and process limits use delegated cgroup v2 controllers. A launch with an unavailable requested limit fails with a specific diagnostic.

The runtime uses the service manager available in the user session. Kernel features and session resources determine host compatibility.

## Host communication

Direct sockets and devices are opt-in manifest fields. Narrow system operations use brokers:

- the system broker accepts only built-in action types
- local peer validation ties requests to the running package instance
- compatibility commands are parsed before the broker request is created
- streamed actions preserve output channels, exit status, and cancellation

Every compatibility shim maps to a typed request and its effective package permission.

## User overrides

The manifest defines package defaults. Users can remove access or add a local grant. Updates compare the effective old and new permissions and ask before accepting additions.

`cpak update --non-interactive` rejects updates that require new permissions. This is the recommended mode for unattended systems.

## Limits of the boundary

A package with read-write home access can modify user files. A package with the session bus can call services exposed on that bus. Full devices, process sharing, system bus access, host root mounts, and root inside the environment all expand the trusted surface.

Review the manifest before running an untrusted package. The Store highlights high-risk permissions. The manifest and local override define the authoritative policy.
