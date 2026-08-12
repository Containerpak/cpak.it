---
title: Repository map
description: Find the project that owns the runtime, package, image, SDK, broker, Store, or website change.
tags: [contributing, repositories, ownership]
section: project
order: 20
---

# Repository map

Use this map before opening a change. Repository boundaries follow ownership and release lifecycle.

## Runtime and integration

| Repository                                                      | Owns                                                                                        |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [Containerpak/cpak](https://github.com/Containerpak/cpak)       | CLI, store, OCI resolution, transactions, runtime, sandbox, brokers, manifests, and schema. |
| [mirkobrombin/DaBaDee](https://github.com/mirkobrombin/DaBaDee) | Content hashing and hard-link deduplication.                                                |

The cpak runtime default branch is `v2`. Host integration providers live in the cpak binary. DaBaDee is a Go dependency of the runtime.

## Shared images

| Repository                                                    | Owns                                                                               |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [Containerpak/images](https://github.com/Containerpak/images) | General base runtime images shared by cpak packages.                               |
| [Containerpak/wine](https://github.com/Containerpak/wine)     | Multiarch environment used by packages that supply their own Wine-derived runtime. |

A shared image should contain the environment needed by several packages, not a copy of the consuming application.

## Packages and SDKs

Official packages live in one repository per application under [Containerpak](https://github.com/Containerpak). Bottles, UMU, Firefox, Chrome, VS Code, GIMP, Inkscape, LibreOffice, OBS Studio, and VLC each own their manifest and image workflow.

Language toolchains use the same model:

| Repository                                                                | Provides                                                     |
| ------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [Containerpak/sdk-go](https://github.com/Containerpak/sdk-go)             | Go compiler and formatter for cpak development environments. |
| [Containerpak/sdk-node-lts](https://github.com/Containerpak/sdk-node-lts) | Node.js LTS, npm, npx, and Corepack.                         |

An editor lists supported SDK origins as addons. The SDK repository owns toolchain compatibility paths and architecture tests.

## Discovery and documentation

| Repository                                                      | Owns                                                                                       |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [Containerpak/store](https://github.com/Containerpak/store)     | Reviewed catalog metadata, categories, original icons, screenshots, and generated indexes. |
| [Containerpak/cpak.it](https://github.com/Containerpak/cpak.it) | Website, Store frontend, documentation renderer, and project pages.                        |

The Store entry points to a package repository. That repository owns `cpak.json` and its OCI image lifecycle.

## Where a fix belongs

Put namespace, transaction, permission, OCI, broker, or CLI behavior in `cpak`. Put duplicate-file storage logic in DaBaDee. Put an application dependency or launch workaround in that application's package repository. Put shared ABI content in a base image only when several packages need it.

When a change crosses repositories, keep each commit independently valid and update the consumer only after the dependency release or image is available.
