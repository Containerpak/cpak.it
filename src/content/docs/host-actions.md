---
title: Host actions
description: Configure typed, policy-gated host services for an application.
tags: [broker, permissions, containers]
section: runtime
order: 35
---

# Host actions

`hostActions` grants a package capabilities from a provider implemented by cpak. Every provider accepts a finite structured request and maps it to a fixed host operation. Arbitrary host executables are outside this interface.

## Container provider

The first provider offers controlled access to supported host container engines:

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

`manage-owned` is limited to containers carrying the requesting package ownership label. `exec-owned` runs commands inside those owned containers.

## Compatibility shims

When the provider is enabled, cpak places independent `podman` and `docker` shims in the package. Calling `podman` selects the host Podman engine and calling `docker` selects the host Docker engine. Visual Studio Code can use either engine through the same bounded provider policy.

Both shims expose the same finite CLI subset and convert each invocation to a provider request. Standard output, standard error, exit status, and cancellation pass through the shim. If the selected engine is not installed on the host, that command fails with a direct backend unavailable error while the other shim remains usable.

Unsupported commands and flags fail locally. Privileged mode, device grants, host namespaces, and arbitrary backend options are not forwarded.

## Filesystem policy

A nested container can mount source paths present in the cpak `filesystem` permission. The broker resolves symlinks before comparison and preserves read-only access.

## Nested packages

A nested cpak receives the intersection of the parent and child host action capabilities, including local user overrides.

## Legacy manifests

The old `allowedHostCommands` field remains readable for migration. cpak converts `notify-send`, `xdg-open`, and `cpak-launch-app` to their typed permissions. Entries outside this mapping fail manifest validation.
