A desktop application sometimes needs a host service. The unsafe answer is to expose a host command. A cpak host action describes the operation instead, so policy can decide before any backend is called.

## Start with capabilities, not commands

The container provider is a useful example:

```
"hostActions": [
  {
    "provider": "containers",
    "capabilities": ["read", "manage-owned", "exec-owned"]
  }
]
```

`read` lists and inspects. `manage-owned` creates and changes only containers carrying the requesting package ownership label. `exec-owned` runs inside those owned containers. None means "forward anything to Podman".

## Define a finite request

A provider needs an operation enum and a schema for each operation. Validate names, identifiers, paths and option values before selecting a backend. Reject unknown fields. Resolve symlinks before comparing a requested mount with the package filesystem policy.

Ownership must come from authenticated package identity, never from a label supplied by the caller. Cancellation belongs to the request context so a stopped package does not leave a host operation running.

## Compatibility shims are parsers

cpak can expose `podman` and `docker` commands without forwarding their complete command lines. Each shim accepts a documented CLI subset, parses it locally and creates one typed provider request. Unsupported commands and flags fail before the broker is reached.

A useful shim still preserves standard input, output, error, exit status and cancellation. That lets an editor use familiar tooling without turning the shim into a generic host execution channel.

## Nested packages intersect capabilities

A nested dependency receives the capabilities allowed by both its own manifest and its parent. The dependency cannot expand the parent boundary. A local override can narrow the result again.

Test a provider at three levels: request validation, backend ownership checks and a complete shim call with streams and cancellation. A successful happy path alone does not prove the boundary.

[Host actions](/docs/host-actions) documents the current providers and capability sets.
