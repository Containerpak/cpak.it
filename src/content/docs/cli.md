---
title: CLI reference
description: The cpak commands used to install, inspect, update, and run applications.
tags: [reference, cli]
---

# CLI reference

The core workflow is intentionally small:

```bash
cpak install <source>
cpak list
cpak run <source-or-name> [arguments...]
cpak update
cpak remove <name>
```

Use `cpak shell` to open a shell inside an installed application, `cpak logs` to inspect its output, and `cpak audit` to review the permissions resolved from its manifest.

Nested packages use the same cpak protocol from inside a container. Host operations are sent through the hrun-based command bridge instead of exposing the host filesystem directly.
