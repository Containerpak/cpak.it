---
title: Persistent environments
description: Create mutable Linux environments from distribution packages, keep their state, and manage their permissions and processes.
tags: [environment, distributions, shell, permissions]
section: operations
order: 15
---

# Persistent environments

A cpak environment turns an installed package into a named, mutable workspace. Distribution packages use this interface to provide Fedora, Ubuntu, Debian, Arch Linux, openSUSE, and other complete command-line systems without replacing the cpak runtime.

The package still defines the immutable base, update source, and maximum permission set. The environment adds its own persistent writable layer and private home. Installed packages, configuration, and files remain after the environment stops or the host restarts.

## Create and enter an environment

Install the distribution package first. The environment is tied to that installed package identity:

```bash
cpak install github.com/containerpak/archlinux
cpak environment create --name arch --origin github.com/containerpak/archlinux
cpak environment shell --environment arch
```

`--environment` accepts the name or ID shown by `cpak environment list`. Names are case-insensitive and must be unique.

The shell action runs `sh -i` by default. Select another command and pass its arguments after the action arguments:

```bash
cpak environment shell --environment arch --command /bin/bash -- -l
```

An environment cannot be started by code inside another package. It is a host-user workspace, not a way for one package to acquire another package's authority.

## Persistent state and updates

Stopping an environment ends its active container but retains the writable layer, private home, package-manager database, and environment metadata:

```bash
cpak environment stop --environment arch
```

Entering it again uses the same state. Updating the installed distribution package moves the environment to that new package version while retaining its writable layer:

```bash
cpak update github.com/containerpak/archlinux
cpak environment shell --environment arch
```

Delete the environment only when its installed packages and data are no longer needed:

```bash
cpak environment delete --environment arch
```

Deletion stops its container and removes the environment metadata, writable layer, and private application data. It does not uninstall the distribution package itself.

## Inspect environments

```bash
cpak environment list
cpak environment inspect --environment arch
cpak environment inspect --environment arch --json
```

`list` shows the name, package origin, version, and stable environment ID. `inspect` prints the selected record. Use `--json` for automation.

## Permission policy

An environment begins with the effective policy of its installed package. Its local policy can remove permissions but cannot add anything above that ceiling.

Print the current environment policy and the package ceiling separately:

```bash
cpak environment policy --environment arch
cpak environment permissions --environment arch
```

To narrow the environment, save a complete override object and apply it:

```json
{
  "network": false,
  "hostNetwork": false,
  "filesystem": [],
  "env": []
}
```

```bash
cpak environment policy --environment arch --policy policy.json
```

Use `--policy -` to read the JSON object from standard input. Applying a policy stops the active environment so the next shell starts with the new boundary. A policy that widens the installed package permissions is rejected.

## Processes and signals

Process inspection is scoped to the selected running environment:

```bash
cpak environment processes --environment arch
cpak environment processes --environment arch --json
cpak environment signals
cpak environment signal --environment arch --pid 1234 --signal TERM
```

The PID must belong to that environment. Supported signal names are listed by `cpak environment signals`; arbitrary numeric or unknown signals are rejected.

## Package-specific instructions

Read the package page in the [cpak Store](/store/Distributions) before creating an environment. Distribution maintainers can publish a `STORE-README.md` beside `cpak.json` with the exact package manager, first-update command, login notes, and architecture limits for that release.
