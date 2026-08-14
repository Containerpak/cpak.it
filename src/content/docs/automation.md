---
title: Automation and services
description: Use JSON output, non-interactive updates, orchestration, and explicit service lifecycle in scripts.
tags: [automation, services, ci]
section: operations
order: 50
---

# Automation and services

cpak commands return a failing exit status when the requested operation fails. Scripts should inspect exit status first and use JSON output where a command provides it.

## Machine-readable status

```bash
cpak doctor --json
cpak list --json
cpak update --json
cpak gc --json
cpak alias list --json
```

Use JSON output for status checks and automation. Human tables are presentation output.

## Unattended updates

```bash
cpak update --non-interactive --json
```

The command refuses any update that requests additional permissions. It exits with an error when one or more package updates fail or are denied, while independent successful results remain visible in the output.

## Run several applications

`cpak orchestrate` starts multiple installed applications and can express startup dependencies:

```bash
cpak orchestrate \
  --depends-on frontend=backend \
  --delay 2 \
  --retries 2 \
  backend frontend
```

Add `--health` when each started application can answer a health command. Use `--ignore-errors` only when later applications are safe to start after an earlier failure.

## Service lifecycle

`cpak service` starts the local cpak service. Run it under the service manager available in the user session.

Keep the service in the same user environment as desktop applications so display, audio, XDG paths, and the system broker resolve the intended session.

## Logs and instances

Named instances let automation separate repeated launches of the same package:

```bash
cpak run --instance worker-a github.com/example/worker worker
cpak logs --instance worker-a --follow github.com/example/worker
cpak stop --instance worker-a github.com/example/worker
```

Capture the command exit status and logs around a failing run. cpak propagates the child process result for commands that wait for the application.

## CI package checks

Use `cpak validate`, `cpak lock`, and `cpak test` in package CI after the OCI image has been published. Include a test of the published image through cpak.

Keep production image builds in CI. Local development commands cover package validation and visual testing. The publishing workflow signs and produces each supported architecture.
