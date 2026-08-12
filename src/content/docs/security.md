---
title: Security reporting
description: Report a vulnerability privately and include the evidence needed to reproduce it.
tags: [security, reporting]
section: runtime
order: 50
---

# Security reporting

Do not open a public issue for an unpatched vulnerability that could expose user data, cross a package boundary, execute an undeclared host operation, or corrupt the local store.

## Report privately

Use [GitHub private vulnerability reporting](https://github.com/Containerpak/cpak/security/advisories/new) for the cpak runtime. Select the package repository instead when the problem exists only in one official package or image recipe.

The cpak repository has private vulnerability reporting enabled. The draft advisory remains private while maintainers reproduce and fix the problem.

## Include useful evidence

Provide the affected cpak version or commit, package origin, host kernel, filesystem, and the relevant part of `cpak doctor --json`. Add a minimal reproduction with exact commands and observed access.

For a sandbox issue, state which manifest permissions were enabled. For a store issue, include the operation sequence and audit output. For a broker issue, identify the requested operation and the policy that should have rejected it.

Do not include live credentials or unrelated personal files. Replace secrets while preserving the structure needed to reproduce the parser or transport behavior.

## Scope

Security-sensitive cpak areas include namespace setup, mounts, seccomp, Landlock, user overrides, typed host actions, system broker requests, nested package authorization, OCI verification, runtime source checksums, update transactions, and desktop exports.

An application behaving maliciously within permissions explicitly granted by its manifest is not automatically a cpak boundary bypass. A hidden, misreported, or unenforced permission remains a valid security problem.

## Public follow-up

After a fix is available, the advisory can document affected versions, patched versions, impact, and upgrade steps. Keep exploit details private until users have a reasonable path to update.
