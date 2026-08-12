---
title: Host actions
description: Give an application a typed host service without exposing a host shell.
tags: [broker, permissions, containers]
section: runtime
order: 35
---

# Host actions

`hostActions` grants a package capabilities from a provider implemented by cpak. Providers accept structured requests, not command lines. There is no action for running an arbitrary host executable.

## Container provider

The first provider offers controlled access to the host Podman service:

```json
"hostActions": [
  {
    "provider": "containers",
    "capabilities": ["read", "manage-owned", "exec-owned"]
  }
]
```

| Capability     | Access                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| `read`         | List and inspect host containers, images, logs, and statistics.                                                     |
| `manage-owned` | Create containers carrying the package ownership label, then start, stop, restart, or remove only those containers. |
| `exec-owned`   | Execute a command only inside a container owned by the requesting package.                                          |

`manage-owned` does not grant control over containers created by another cpak or by the user. `exec-owned` does not execute a command directly on the host.

## Compatibility shims

When the provider is enabled, cpak places `podman` and `docker` shims in the package. They support a finite CLI subset and convert it to the provider request. This lets existing tools keep their normal process interface, including separate standard output and standard error, a real exit code, and cancellation.

Unsupported commands and flags fail locally. Privileged mode, device grants, host namespaces, and arbitrary backend options are not forwarded.

## Filesystem policy

A nested container can mount only a source path already present in the cpak `filesystem` permission. The broker resolves symlinks before comparison. A read-only package path can produce only a read-only nested mount.

## Nested packages

A nested cpak receives the intersection of the parent and child host action capabilities. It cannot add a provider or capability denied by either manifest. Local user overrides take part in the same calculation.

## Legacy manifests

The old `allowedHostCommands` field remains readable for migration. cpak converts `notify-send`, `xdg-open`, and `cpak-launch-app` to their typed permissions. Any other command is rejected because it has no provider policy.
