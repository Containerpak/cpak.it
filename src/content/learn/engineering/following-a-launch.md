A cpak launch is easier to debug when you stop treating the container as one operation. It is a sequence of decisions, and each decision leaves a useful place to inspect.

## Resolve the package

The Git origin selects a manifest and the manifest selects an OCI image. A branch may move, while a release, commit and resolved image digest identify a fixed input. `cpak lock` resolves the complete dependency graph before anything starts.

```
cpak validate cpak.json
cpak lock cpak.json
cpak run -v github.com/example/editor editor
```

Validation answers whether the document is accepted. The lock answers what will be installed. Verbose launch output answers which installed records and layers are being used now. Those are different questions.

## Calculate the effective policy

The manifest asks for access. A local override may narrow or extend that request, and a system ceiling can only narrow the result. Nested packages receive the intersection of their own policy and the parent boundary. No later stage can restore access removed here.

Keep this calculation separate from image contents. A library existing in a layer does not grant access to a host device, socket or directory. It only makes the library visible inside the assembled root.

## Compose the root

cpak orders required layer dependencies, the application and enabled addons. The selected storage driver prepares native lower directories for those immutable layers. Rootless OverlayFS assembles the read-only package view and a writable application layer sits above it.

A nested dependency is not added to that root. It keeps its own environment and is reached through the nested package interface. This distinction is why Bottles can require UMU without merging UMU's whole runtime into Bottles.

## Enter the boundary

Namespaces establish the process, mount, IPC, hostname, cgroup and optional network views. Declared host paths and sockets are mounted, then Landlock and seccomp narrow what the process can do after setup. The package process runs as the current user and cannot gain privileges after `no_new_privs`.

A typed broker handles the small set of host operations that cannot live inside that boundary. Logs and exit status return through the supervisor. When a launch fails, identify which of these stages refused it before changing the manifest.

[Architecture](/docs/architecture) maps the same sequence to the source tree. [Troubleshooting](/docs/troubleshooting) gives the commands for each failure class.
