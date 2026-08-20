The cpak sandbox has several independent boundaries. Calling all of them a container hides the reason a permission works and the reason a bypass fails.

## Namespaces choose the world the process sees

The mount namespace starts with the composed package root. Process, IPC, hostname and cgroup namespaces separate runtime state from the host. A network namespace is used unless the manifest grants network access. User namespaces let this happen without making the application a host root process.

Nested user namespaces are blocked by default. Browsers and similar programs can request `userNamespaces` when they need to build another sandbox inside cpak. That permission is specific; it does not grant a host filesystem or system bus.

## Mounts choose which host objects exist

A filesystem grant is converted into a path inside the mount namespace with an explicit read-only or read-write mode. Display, audio, devices and buses have separate manifest fields because each opens a different host object. An absent object cannot be reached by guessing another path to it.

## Landlock narrows path access after setup

The runtime installs Landlock rules after the required paths are open and mounted. This gives the process a kernel-enforced list of readable and writable paths even inside its namespace. The available ABI depends on the host kernel, so `cpak doctor` reports it and a launch can require the sandbox when falling back would be unacceptable.

## seccomp narrows the system call surface

`no_new_privs` prevents privilege gain through setuid execution. seccomp then filters disallowed system calls, including the calls needed to create another user namespace unless that permission was granted. Mount isolation and seccomp solve different problems: one controls visible objects, the other controls kernel operations.

## Brokers do not dissolve the sandbox

A request that must reach the host is converted to a typed broker action. The request carries a finite operation and validated fields, not a shell command. Peer validation ties it to the package instance and the package must hold the matching permission.

The dangerous manifests remain obvious: full home access, session or system buses, broad devices, process sharing and host root mounts all widen the boundary. The sandbox does not make a wide permission narrow.

[Sandbox and threat model](/docs/sandbox) lists every boundary and its host requirements.
