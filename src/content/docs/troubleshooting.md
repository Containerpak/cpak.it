---
title: Troubleshooting
description: Diagnose host support, package startup, permissions, nested services, desktop entries, and store state.
tags: [debugging, logs, recovery]
section: operations
order: 40
---

# Troubleshooting

Start with the narrowest layer that can explain the failure. Keep the full command, package origin, selected reference, cpak build, and host capability report with any bug report.

## Run the host check

```bash
cpak doctor
cpak doctor --json
```

A required namespace or OverlayFS failure blocks application startup. Landlock and cgroup warnings describe protection or limits that the current host cannot apply.

## Read application logs

```bash
cpak logs github.com/example/app
cpak logs --lines 300 github.com/example/app
cpak logs --follow github.com/example/app
```

Use `--instance` when the package has more than one running instance. Nested dependency failures may have their own origin and log stream.

## Open a package shell

```bash
cpak shell github.com/example/app
```

Check that declared binaries, desktop files, libraries, and mounted paths exist. Compare the package environment with the `cpak.json` permission set before adding more access.

## Reproduce a local package

Inside a package repository:

```bash
cpak validate cpak.json
cpak lock cpak.json
cpak test cpak.json --binary /usr/bin/example -- --version
cpak dev cpak.json --binary /usr/bin/example
```

These commands use a temporary store and isolate package debugging from installed applications.

## Check permissions

Symptoms such as a missing window, silent audio, inaccessible files, failed browser sandbox, or blocked external link usually map to one concrete permission. Review display sockets, audio, DRI, filesystem paths, `userNamespaces`, broker fields, and host commands.

Do not enable the session bus, system bus, all devices, or host root as a generic fix. Confirm the resource the application attempted to access.

## Repair store state

```bash
cpak audit
cpak audit --repair
cpak gc --json
```

Audit first. Garbage collection is for unreferenced content, not for repairing active package records.

## Desktop entry does not appear

Confirm that the manifest path is absolute, ends in `.desktop`, and exists in the final image. Its `Exec` target must be a declared or available binary. Reinstall or update the package after changing only manifest metadata so cpak refreshes the exported entry.

## An update is refused

Inspect the structured update result:

```bash
cpak update --json github.com/example/app
```

`permission-denied` means the new package requested additional access in a non-interactive flow or the user declined it. `pinned` means the installed commit is intentionally immutable.

## Report a reproducible problem

Include:

- the output of `cpak doctor --json`
- the exact command and exit status
- the package origin and selected branch, release, or commit
- the relevant `cpak logs` excerpt
- the smallest sequence that reproduces the failure

Hide credentials, home directory names, and unrelated environment values. Use code fences for long logs.
