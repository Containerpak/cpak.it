<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import { COURSE } from "../course";

  const lesson = COURSE.modules[2].lessons[0];
</script>

<Seo
  title="Implement a storage driver - cpak"
  description="Implement the cpak storage protocol, publish native layer checkouts atomically and satisfy the driver conformance contract."
  path="/learn/engineering/writing-a-storage-driver"
/>

<LessonShell course={COURSE} {lesson}>
  <p>
    A storage driver does not mount an application and it does not own application
    data. It derives rebuildable native directories from immutable source layers.
    cpak gives those directories to rootless OverlayFS when the application starts.
  </p>

  <h2>The runtime index is the launch path</h2>

  <p>
    Maintenance calls the driver to prepare and verify layer checkouts. A prepared
    launch reads an atomic runtime index directly, so starting an application does
    not wait for a daemon round trip. The driver exits after maintenance.
  </p>

  <h2>Protocol v1</h2>

  <p>
    The protocol uses one newline-terminated JSON request and response on each
    private Unix socket connection. Frames are limited to 1 MiB. The socket is
    mode <code>0600</code> below a mode <code>0700</code> directory, and the server
    accepts only the same user ID.
  </p>

  <div class="table-wrap">
    <table>
      <thead><tr><th>Method</th><th>Responsibility</th></tr></thead>
      <tbody>
        <tr><td><code>probe</code></td><td>Report identity, protocol and capabilities.</td></tr>
        <tr><td><code>prepare</code></td><td>Publish checkouts for ordered layers.</td></tr>
        <tr><td><code>verify</code></td><td>Check derived data and optionally repair it.</td></tr>
        <tr><td><code>remove</code></td><td>Remove selected derived checkouts.</td></tr>
        <tr><td><code>gc</code></td><td>Report or remove derived data with no live layer.</td></tr>
        <tr><td><code>shutdown</code></td><td>Stop the on-demand process.</td></tr>
      </tbody>
    </table>
  </div>

  <h2>Prepare without breaking the previous view</h2>

  <p>
    Build a checkout in a temporary location, validate it and publish it with an
    atomic rename. A failed preparation must leave the last valid checkout
    available. Completed layers from an interrupted batch may be reused after
    verification on the next attempt.
  </p>

  <p>
    Return OverlayFS lower directories in highest-priority-first order. cpak
    validates every returned path against the assigned driver root after resolving
    symlinks. Source layers remain unchanged during prepare, repair, removal and
    garbage collection.
  </p>

  <h2>Derived data must stay disposable</h2>

  <p>
    FVS can reconstruct native checkouts from content-defined source blocks and
    reuse complete files through reflinks or hard links. DaBaDee implements the
    same cpak contract with whole-file deduplication. Different internal storage
    is fine; the observable protocol and recovery rules are the contract.
  </p>

  <h2>Ship against the conformance suite</h2>

  <p>
    <code>github.com/containerpak/storage</code> provides the Go client, server,
    atomic index, validation and shared conformance tests. An external binary is
    started without network access and confined to its source, driver and socket
    roots. cpak refuses it when the host cannot apply that confinement.
  </p>

  <pre><code>cpak storage status --json
cpak storage migrate
cpak storage verify --repair</code></pre>

  <p><a href="/docs/storage-drivers">Storage drivers</a> contains the deployment and protocol reference.</p>
</LessonShell>
