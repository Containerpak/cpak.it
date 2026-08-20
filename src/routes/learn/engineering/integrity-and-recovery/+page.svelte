<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import { COURSE } from "../course";

  const lesson = COURSE.modules[2].lessons[2];
</script>

<Seo
  title="Keep updates and launches verifiable - cpak"
  description="Follow cpak integrity from OCI descriptors through atomic updates, verified launch and rollback without confusing unknown state with tampering."
  path="/learn/engineering/integrity-and-recovery"
/>

<LessonShell course={COURSE} {lesson}>
  <p>
    Integrity is a chain of smaller checks. The registry proves which bytes an
    OCI descriptor names, the package transaction proves which complete state
    became active and verified launch proves the local store still describes the
    state recorded at installation.
  </p>

  <h2>Resolve immutable inputs</h2>

  <p>
    The OCI client selects the current architecture from an image index, checks
    every descriptor and stores layers by SHA-256 digest. A package lock records
    the resolved manifest and image digests for the complete dependency graph.
    Runtime sources add their own exact size and digest.
  </p>

  <h2>Switch only after staging succeeds</h2>

  <p>
    An install or update stages the manifest, OCI layers, runtime sources,
    dependencies, desktop exports and database record. The active package record
    changes only after every required part is ready. An interrupted transaction
    is recovered without replacing the previous working version with a partial
    one.
  </p>

  <p>
    Rollback restores the previous manifest-derived runtime view. Writable
    application data remains separate, so an application that migrated its own
    files may still need application-specific recovery.
  </p>

  <h2>Record identity and policy separately</h2>

  <p>
    Verified launch derives a package root for identity and a policy root for
    effective access, then combines them into the launch root kept in the
    root-owned ledger. Permissions can therefore narrow without pretending the
    package bytes changed, and an update can change the package without silently
    changing its access.
  </p>

  <h2>Unknown and contradictory are not the same</h2>

  <p>
    Enforcement controls an unenrolled or otherwise unknown state. At
    <code>off</code> it may start, <code>warn</code> reports it and
    <code>refuse</code> stops it. A tampered store contradicts a state cpak already
    knows and is refused at every level.
  </p>

  <p>
    <code>cpak audit</code> checks installed records and layer bindings.
    <code>cpak system explain</code> puts the recorded and derived launch state
    beside each other. A binding backfill records the current disk state; it is a
    migration tool, not proof that the old bytes were authentic.
  </p>

  <p>
    <a href="/docs/verified-launch">Verified launch</a> defines each result.
    <a href="/docs/updates">Updates and rollback</a> covers the transaction path.
  </p>
</LessonShell>
