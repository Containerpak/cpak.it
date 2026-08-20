cpak crosses two boundaries that look similar from an application but have different owners. A nested request starts another package as the same user. A session request changes a login choice owned by the host. Both begin with a package origin, but neither may trust an identity written by the caller.

## Nested packages stay separate

A nested dependency is installed with its parent but keeps its own immutable layers, writable state and process environment. The parent receives a scoped endpoint for that declared dependency rather than the cpak database or the host control socket.

The host resolves the dependency from the installed graph, authenticates the parent instance from the connection and intersects the child policy with the parent boundary. A parent cannot name an undeclared origin or claim another package identity in the request.

Streams, exit status and cancellation return through the nested protocol. Shared files need explicit paths accepted by both policies. Keep state with the package that naturally owns it so replacing a runtime does not carry away unrelated parent data.

## A login session changes the host

```
"sessions": [
  {
    "id": "com.example.desktop",
    "name": "Example Desktop",
    "kind": "desktop",
    "entrypoint": "/usr/bin/example-session",
    "override": { "deviceDri": true, "deviceInput": true }
  }
]
```

A session has its own permission set because it owns a display and input for the duration of a login. Its identifier is global and cannot replace a system entry or one registered by another package. The entrypoint must also be an exported binary.

## Privilege belongs to one narrow operation

The user-side cpak resolves the installed package and validates the session before asking the system authority to register it. The authority receives fixed metadata and a package origin, not an arbitrary command. Polkit carries interactive authorization on hosts with a system bus; a credential-checked Unix socket covers hosts without one.

The fixed root-owned launcher later receives only the registered session ID. It resolves the current installed package at login, which keeps a session on the same version and update path as the windowed application.

[Nested cpak](/docs/nested-cpak) covers the child protocol. [Desktop and kiosk sessions](/docs/desktop-sessions) covers the authority and display manager integration.
