---
title: Nested cpak
description: Declare and run a cpak dependency as a controlled service inside another package.
tags: [nested, dependencies, runtime]
section: runtime
order: 40
---

# Nested cpak

Nested cpak lets an application run a declared dependency in a separate package environment. The parent owns its interface and state while the dependency supplies its runtime and binaries.

## Declare the dependency

Add the nested package as a manifest dependency:

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

The parent receives a request path scoped to its declared dependency. The host cpak database and control socket stay outside the parent environment.

## Files and state

The nested package has its own immutable layers and writable state. Explicit shared paths can connect the parent workflow to the dependency when both manifests allow them.

Keep application-owned files in the parent unless the nested runtime is their natural owner. This prevents an update or replacement of the dependency from taking unrelated parent data with it.

## Permissions

The nested package uses the intersection of its manifest, user overrides, and the parent permission boundary. A dependency declaration grants no additional host access to the parent.

## Lifecycle and logs

Nested instances use the cpak supervisor. Their output is available through cpak logs and they use the same instance lifecycle. Parent errors should include the nested package origin and the failing request.

## Test the integration

Test the dependency as a standalone cpak first. Then test the complete parent workflow through cpak, including first install, repeated launch, update, rollback, and cleanup.

Validate the complete nested workload after checking binary discovery. A package that manages a runtime should create its state and launch a representative application through the dependency.
