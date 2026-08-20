A storage driver does not mount an application and it does not own application data. It derives rebuildable native directories from immutable source layers. cpak gives those directories to rootless OverlayFS when the application starts.

## The runtime index is the launch path

Maintenance calls the driver to prepare and verify layer checkouts. A prepared launch reads an atomic runtime index directly, so starting an application does not wait for a daemon round trip. The driver exits after maintenance.

## Protocol v1

The protocol uses one newline-terminated JSON request and response on each private Unix socket connection. Frames are limited to 1 MiB. The socket is mode `0600` below a mode `0700` directory, and the server accepts only the same user ID.

| Method     | Responsibility                                    |
| ---------- | ------------------------------------------------- |
| `probe`    | Report identity, protocol and capabilities.       |
| `prepare`  | Publish checkouts for ordered layers.             |
| `verify`   | Check derived data and optionally repair it.      |
| `remove`   | Remove selected derived checkouts.                |
| `gc`       | Report or remove derived data with no live layer. |
| `shutdown` | Stop the on-demand process.                       |

## Prepare without breaking the previous view

Build a checkout in a temporary location, validate it and publish it with an atomic rename. A failed preparation must leave the last valid checkout available. Completed layers from an interrupted batch may be reused after verification on the next attempt.

Return OverlayFS lower directories in highest-priority-first order. cpak validates every returned path against the assigned driver root after resolving symlinks. Source layers remain unchanged during prepare, repair, removal and garbage collection.

## Derived data must stay disposable

FVS can reconstruct native checkouts from content-defined source blocks and reuse complete files through reflinks or hard links. DaBaDee implements the same cpak contract with whole-file deduplication. Different internal storage is fine; the observable protocol and recovery rules are the contract.

## Ship against the conformance suite

`github.com/containerpak/storage` provides the Go client, server, atomic index, validation and shared conformance tests. An external binary is started without network access and confined to its source, driver and socket roots. cpak refuses it when the host cannot apply that confinement.

```
cpak storage status --json
cpak storage migrate
cpak storage verify --repair
```

[Storage drivers](/docs/storage-drivers) contains the deployment and protocol reference.
