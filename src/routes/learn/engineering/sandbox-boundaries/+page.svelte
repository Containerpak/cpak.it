<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import { COURSE } from "../course";

  const lesson = COURSE.modules[0].lessons[1];
</script>

<Seo
  title="Build the sandbox in layers - cpak"
  description="Understand what namespaces, mount policy, Landlock, seccomp and no_new_privs each contribute to a cpak sandbox."
  path="/learn/engineering/sandbox-boundaries"
/>

<LessonShell course={COURSE} {lesson}>
  <p>
    The cpak sandbox has several independent boundaries. Calling all of them a
    container hides the reason a permission works and the reason a bypass fails.
  </p>

  <h2>Namespaces choose the world the process sees</h2>

  <p>
    The mount namespace starts with the composed package root. Process, IPC,
    hostname and cgroup namespaces separate runtime state from the host. A
    network namespace is used unless the manifest grants network access. User
    namespaces let this happen without making the application a host root process.
  </p>

  <p>
    Nested user namespaces are blocked by default. Browsers and similar programs
    can request <code>userNamespaces</code> when they need to build another
    sandbox inside cpak. That permission is specific; it does not grant a host
    filesystem or system bus.
  </p>

  <h2>Mounts choose which host objects exist</h2>

  <p>
    A filesystem grant is converted into a path inside the mount namespace with
    an explicit read-only or read-write mode. Display, audio, devices and buses
    have separate manifest fields because each opens a different host object.
    An absent object cannot be reached by guessing another path to it.
  </p>

  <h2>Landlock narrows path access after setup</h2>

  <p>
    The runtime installs Landlock rules after the required paths are open and
    mounted. This gives the process a kernel-enforced list of readable and
    writable paths even inside its namespace. The available ABI depends on the
    host kernel, so <code>cpak doctor</code> reports it and a launch can require
    the sandbox when falling back would be unacceptable.
  </p>

  <h2>seccomp narrows the system call surface</h2>

  <p>
    <code>no_new_privs</code> prevents privilege gain through setuid execution.
    seccomp then filters disallowed system calls, including the calls needed to
    create another user namespace unless that permission was granted. Mount
    isolation and seccomp solve different problems: one controls visible objects,
    the other controls kernel operations.
  </p>

  <h2>Brokers do not dissolve the sandbox</h2>

  <p>
    A request that must reach the host is converted to a typed broker action.
    The request carries a finite operation and validated fields, not a shell
    command. Peer validation ties it to the package instance and the package must
    hold the matching permission.
  </p>

  <p>
    The dangerous manifests remain obvious: full home access, session or system
    buses, broad devices, process sharing and host root mounts all widen the
    boundary. The sandbox does not make a wide permission narrow.
  </p>

  <p><a href="/docs/sandbox">Sandbox and threat model</a> lists every boundary and its host requirements.</p>
</LessonShell>
