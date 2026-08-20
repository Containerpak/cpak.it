<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import { COURSE } from "../course";

  const lesson = COURSE.modules[1].lessons[0];
</script>

<Seo
  title="Design a typed host action - cpak"
  description="Design a finite broker provider, preserve command semantics through a compatibility shim and keep host operations inside package policy."
  path="/learn/engineering/typed-host-actions"
/>

<LessonShell course={COURSE} {lesson}>
  <p>
    A desktop application sometimes needs a host service. The unsafe answer is
    to expose a host command. A cpak host action describes the operation instead,
    so policy can decide before any backend is called.
  </p>

  <h2>Start with capabilities, not commands</h2>

  <p>The container provider is a useful example:</p>

  <pre><code>"hostActions": [
  &lbrace;
    "provider": "containers",
    "capabilities": ["read", "manage-owned", "exec-owned"]
  &rbrace;
]</code></pre>

  <p>
    <code>read</code> lists and inspects. <code>manage-owned</code> creates and
    changes only containers carrying the requesting package ownership label.
    <code>exec-owned</code> runs inside those owned containers. None means
    "forward anything to Podman".
  </p>

  <h2>Define a finite request</h2>

  <p>
    A provider needs an operation enum and a schema for each operation. Validate
    names, identifiers, paths and option values before selecting a backend. Reject
    unknown fields. Resolve symlinks before comparing a requested mount with the
    package filesystem policy.
  </p>

  <p>
    Ownership must come from authenticated package identity, never from a label
    supplied by the caller. Cancellation belongs to the request context so a
    stopped package does not leave a host operation running.
  </p>

  <h2>Compatibility shims are parsers</h2>

  <p>
    cpak can expose <code>podman</code> and <code>docker</code> commands without
    forwarding their complete command lines. Each shim accepts a documented CLI
    subset, parses it locally and creates one typed provider request. Unsupported
    commands and flags fail before the broker is reached.
  </p>

  <p>
    A useful shim still preserves standard input, output, error, exit status and
    cancellation. That lets an editor use familiar tooling without turning the
    shim into a generic host execution channel.
  </p>

  <h2>Nested packages intersect capabilities</h2>

  <p>
    A nested dependency receives the capabilities allowed by both its own
    manifest and its parent. The dependency cannot expand the parent boundary.
    A local override can narrow the result again.
  </p>

  <p>
    Test a provider at three levels: request validation, backend ownership checks
    and a complete shim call with streams and cancellation. A successful happy
    path alone does not prove the boundary.
  </p>

  <p><a href="/docs/host-actions">Host actions</a> documents the current providers and capability sets.</p>
</LessonShell>
