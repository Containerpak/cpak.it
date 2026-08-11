---
title: Nested cpak
description: Declare and run a cpak dependency as a controlled service inside another package.
tags: [nested, dependencies, runtime]
section: runtime
order: 40
---

# Nested cpak

Nested cpak lets an application use another cpak package without embedding that dependency into its own image. Bottles can use the UMU package this way: the parent keeps its UI and application state, while UMU supplies its dedicated runtime environment.

## Declare the dependency

Add the nested package as a normal manifest dependency:

```json
"dependencies": [
  {
    "origin": "github.com/containerpak/umu",
    "branch": "main"
  }
]
```

cpak installs the dependency with the parent and records it in the package graph. Shared layers remain deduplicated in the local store.

## Request execution

The parent package sends a structured nested request to the cpak service. The host runtime resolves the installed dependency, applies its manifest, starts or reuses the requested instance, and returns the result through the private protocol.

The parent does not mount the host cpak database or control socket directly. It receives only the request path needed for its declared dependency.

## Files and state

The nested package has its own immutable layers and writable state. Explicit shared paths can connect the parent workflow to the dependency when both manifests allow them.

Keep application-owned files in the parent unless the nested runtime is their natural owner. This prevents an update or replacement of the dependency from taking unrelated parent data with it.

## Permissions

The nested package runs with its own manifest and user overrides. It does not inherit every permission from the parent. The parent also cannot use dependency declaration as a way to gain the dependency's host access.

## Lifecycle and logs

Nested instances use the normal cpak supervisor. Their output is available through cpak logs, and they stop through the same instance lifecycle. Parent errors should include the nested package origin and the failing request so users can diagnose the correct layer.

## Test the integration

Test the dependency as a standalone cpak first. Then test the complete parent workflow through cpak, including first install, repeated launch, update, rollback, and cleanup.

For Bottles and UMU, a successful test creates a real UMU prefix and launches the selected Windows application through the nested package. Detecting the shim or printing a version is only a preliminary check.
