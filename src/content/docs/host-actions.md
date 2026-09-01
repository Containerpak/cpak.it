---
title: Host actions
description: Configure typed, policy-gated host services for an application.
tags: [broker, permissions, containers, environments]
section: runtime
order: 35
---

# Host actions

`hostActions` grants a package capabilities from a provider implemented by cpak. Every provider accepts a finite structured request and maps it to a fixed host operation. Arbitrary host executables are outside this interface.

cpak includes two providers: `containers` for controlled access to Podman or Docker, and `cpak` for discovery and persistent environment operations.

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

## Container shims

When the provider is enabled, cpak places independent `podman` and `docker` shims in the package. Calling `podman` selects the host Podman engine and calling `docker` selects the host Docker engine. Visual Studio Code can use either engine through the same bounded provider policy.

Both shims expose the same finite CLI subset and convert each invocation to a provider request. Standard output, standard error, exit status, and cancellation pass through the shim. If the selected engine is not installed on the host, that command fails with a direct backend unavailable error while the other shim remains usable.

Unsupported commands and flags fail locally. Privileged mode, device grants, host namespaces, and arbitrary backend options are not forwarded.

## cpak provider

Environment frontends can use the host cpak installation without receiving a host shell:

```json
"hostActions": [
  {
    "provider": "cpak",
    "capabilities": ["read", "manage", "exec"]
  }
]
```

| Capability | Access                                                                                                                                                      | Accepted operations                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `read`     | List discoverable packages and environments; inspect environment permissions, processes, and application exports; list supported signals.                   | `discover list`; `environment list`, `permissions`, `processes`, `application-exports`, `signals`                            |
| `manage`   | Install a distribution package; create, configure, stop, or delete an environment; export or remove an application launcher; signal an environment process. | `discover install`; `environment create`, `policy`, `stop`, `delete`, `export-application`, `unexport-application`, `signal` |
| `exec`     | Run a selected command inside one persistent environment, with an interactive terminal when requested.                                                      | `environment shell`                                                                                                          |

The `cpak-host` shim exposes only these operations. For example:

```sh
cpak-host discover list
cpak-host environment list --json
cpak-host environment permissions --environment ENVIRONMENT_ID --json
cpak-host environment create --name Ubuntu --origin github.com/containerpak/ubuntu --json
cpak-host environment shell --environment ENVIRONMENT_ID --terminal --command /bin/bash
```

The broker validates the complete argument shape before starting the host binary. It rejects unsupported cpak commands, unknown options, malformed identifiers, non-positive process IDs, and terminal requests without an interactive input. Standard input, output, error, exit status, terminal size, and cancellation pass through the shim.

## Other typed host operations

Desktop notifications, URI handling, host application launches, and file selection also use the system broker, but they are not `hostActions` providers. Declare them with `notification`, `openURI`, `hostApplications`, and `filePicker`. See [Permissions](/docs/permissions) and [File chooser access](/docs/file-access) for their policy fields.

## Filesystem policy

A nested container can mount source paths present in the cpak `filesystem` permission. The broker resolves symlinks before comparison and preserves read-only access.

## Nested packages

A nested cpak receives the intersection of the parent and child capabilities for each provider, including local user overrides. A child cannot add a provider or capability that its parent does not grant.

## Legacy manifests

The old `allowedHostCommands` field remains readable for migration. cpak converts `notify-send`, `xdg-open`, and `cpak-launch-app` to their typed permissions. Entries outside this mapping fail manifest validation.
