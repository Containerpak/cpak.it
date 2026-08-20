<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import { COURSE } from "../course";

  const lesson = COURSE.modules[1].lessons[1];
</script>

<Seo
  title="Cross boundaries without losing identity - cpak"
  description="Keep package identity and policy intact across nested package requests, desktop sessions and the privileged system authority."
  path="/learn/engineering/sessions-and-nested-runs"
/>

<LessonShell course={COURSE} {lesson}>
  <p>
    cpak crosses two boundaries that look similar from an application but have
    different owners. A nested request starts another package as the same user.
    A session request changes a login choice owned by the host. Both begin with
    a package origin, but neither may trust an identity written by the caller.
  </p>

  <h2>Nested packages stay separate</h2>

  <p>
    A nested dependency is installed with its parent but keeps its own immutable
    layers, writable state and process environment. The parent receives a scoped
    endpoint for that declared dependency rather than the cpak database or the
    host control socket.
  </p>

  <p>
    The host resolves the dependency from the installed graph, authenticates the
    parent instance from the connection and intersects the child policy with the
    parent boundary. A parent cannot name an undeclared origin or claim another
    package identity in the request.
  </p>

  <p>
    Streams, exit status and cancellation return through the nested protocol.
    Shared files need explicit paths accepted by both policies. Keep state with
    the package that naturally owns it so replacing a runtime does not carry away
    unrelated parent data.
  </p>

  <h2>A login session changes the host</h2>

  <pre><code>"sessions": [
  &lbrace;
    "id": "com.example.desktop",
    "name": "Example Desktop",
    "kind": "desktop",
    "entrypoint": "/usr/bin/example-session",
    "override": &lbrace; "deviceDri": true, "deviceInput": true &rbrace;
  &rbrace;
]</code></pre>

  <p>
    A session has its own permission set because it owns a display and input for
    the duration of a login. Its identifier is global and cannot replace a system
    entry or one registered by another package. The entrypoint must also be an
    exported binary.
  </p>

  <h2>Privilege belongs to one narrow operation</h2>

  <p>
    The user-side cpak resolves the installed package and validates the session
    before asking the system authority to register it. The authority receives
    fixed metadata and a package origin, not an arbitrary command. Polkit carries
    interactive authorization on hosts with a system bus; a credential-checked
    Unix socket covers hosts without one.
  </p>

  <p>
    The fixed root-owned launcher later receives only the registered session ID.
    It resolves the current installed package at login, which keeps a session on
    the same version and update path as the windowed application.
  </p>

  <p>
    <a href="/docs/nested-cpak">Nested cpak</a> covers the child protocol.
    <a href="/docs/desktop-sessions">Desktop and kiosk sessions</a> covers the
    authority and display manager integration.
  </p>
</LessonShell>
